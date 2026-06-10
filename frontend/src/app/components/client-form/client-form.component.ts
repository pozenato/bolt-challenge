import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMaskDirective } from 'ngx-mask';
import { ClientService } from '../../services/client.service';
import { Client, ConsumerUnit } from '../../models/client.model';
import { documentValidator } from '../../validators/document.validator';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgxMaskDirective
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditMode = false;
  loadingCep = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client?: Client }
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.client;
    this.initForm();
    if (this.isEditMode && this.data.client) {
      this.populateForm(this.data.client);
    }
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      document: ['', [Validators.required, documentValidator()]],
      active: [true],
      clientAddress: this.fb.group({
        cep: ['', [Validators.required]],
        street: ['', [Validators.required]],
        neighborhood: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        number: ['', [Validators.required]],
        complement: ['']
      }),
      consumerUnits: this.fb.array([])
    });
  }

  get consumerUnits(): FormArray {
    return this.clientForm.get('consumerUnits') as FormArray;
  }

  private populateForm(client: Client): void {
    this.clientForm.patchValue({
      name: client.name,
      document: client.document,
      active: client.active,
      clientAddress: {
        cep: client.clientAddress.cep,
        street: client.clientAddress.street,
        neighborhood: client.clientAddress.neighborhood,
        city: client.clientAddress.city,
        state: client.clientAddress.state,
        number: client.clientAddress.number,
        complement: client.clientAddress.complement
      }
    });

    if (client.consumerUnits) {
      client.consumerUnits.forEach(unit => {
        this.addConsumerUnit(unit);
      });
    }
  }

  createConsumerUnitGroup(unit?: ConsumerUnit): FormGroup {
    return this.fb.group({
      id: [unit ? unit.id : null],
      name: [unit ? unit.name : '', [Validators.required]],
      installationNumber: [unit ? unit.installationNumber : '', [Validators.required]],
      address: this.fb.group({
        cep: [unit ? unit.address.cep : '', [Validators.required]],
        street: [unit ? unit.address.street : '', [Validators.required]],
        neighborhood: [unit ? unit.address.neighborhood : '', [Validators.required]],
        city: [unit ? unit.address.city : '', [Validators.required]],
        state: [unit ? unit.address.state : '', [Validators.required]],
        number: [unit ? unit.address.number : '', [Validators.required]],
        complement: [unit ? unit.address.complement : '']
      })
    });
  }

  addConsumerUnit(unit?: ConsumerUnit): void {
    this.consumerUnits.push(this.createConsumerUnitGroup(unit));
  }

  removeConsumerUnit(index: number): void {
    this.consumerUnits.removeAt(index);
  }

  searchClientCep(): void {
    const cepControl = this.clientForm.get('clientAddress.cep');
    if (!cepControl || cepControl.invalid) return;

    const cep = cepControl.value.replace(/\D/g, '');
    if (cep.length === 8) {
      this.loadingCep = true;
      this.clientService.consultCep(cep).subscribe({
        next: (res) => {
          if (res.erro) {
            this.snackBar.open('CEP não encontrado.', 'OK', { duration: 3000 });
            this.resetAddressGroup(this.clientForm.get('clientAddress') as FormGroup);
          } else {
            this.clientForm.get('clientAddress')?.patchValue({
              street: res.logradouro,
              neighborhood: res.bairro,
              city: res.localidade,
              state: res.uf
            });
          }
          this.loadingCep = false;
        },
        error: () => {
          this.snackBar.open('Erro ao consultar CEP.', 'Fechar', { duration: 3000 });
          this.loadingCep = false;
        }
      });
    }
  }

  searchUnitCep(index: number): void {
    const unitGroup = this.consumerUnits.at(index) as FormGroup;
    const cepControl = unitGroup.get('address.cep');
    if (!cepControl || cepControl.invalid) return;

    const cep = cepControl.value.replace(/\D/g, '');
    if (cep.length === 8) {
      this.clientService.consultCep(cep).subscribe({
        next: (res) => {
          if (res.erro) {
            this.snackBar.open('CEP da unidade não encontrado.', 'OK', { duration: 3000 });
            this.resetAddressGroup(unitGroup.get('address') as FormGroup);
          } else {
            const stateUpper = res.uf.toUpperCase();
            if (stateUpper === 'SP' || stateUpper === 'RS' || stateUpper === 'PR') {
              this.snackBar.open(`Não atendemos a região do estado de ${stateUpper}.`, 'Atenção', {
                duration: 5000,
                panelClass: ['snackbar-warning']
              });
              cepControl.setErrors({ unservicedRegion: true });
              this.resetAddressGroup(unitGroup.get('address') as FormGroup);
            } else {
              if (cepControl.hasError('unservicedRegion')) {
                cepControl.setErrors(null);
              }
              unitGroup.get('address')?.patchValue({
                street: res.logradouro,
                neighborhood: res.bairro,
                city: res.localidade,
                state: res.uf
              });
            }
          }
        },
        error: () => {
          this.snackBar.open('Erro ao consultar CEP da unidade.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  private resetAddressGroup(group: FormGroup): void {
    group.patchValue({
      street: '',
      neighborhood: '',
      city: '',
      state: ''
    });
  }

  save(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    // Get raw value including disabled controls
    const formValue = this.clientForm.getRawValue();
    
    // Clean masks before sending to backend
    formValue.document = formValue.document.replace(/\D/g, '');
    formValue.clientAddress.cep = formValue.clientAddress.cep.replace(/\D/g, '');
    if (formValue.consumerUnits) {
      formValue.consumerUnits.forEach((unit: any) => {
        unit.address.cep = unit.address.cep.replace(/\D/g, '');
      });
    }

    this.saving = true;
    if (this.isEditMode) {
      this.clientService.update(this.data.client!.id!, formValue).subscribe({
        next: () => {
          this.snackBar.open('Cliente atualizado com sucesso.', 'OK', { duration: 3000 });
          this.saving = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.saving = false;
          const msg = err.error?.error || 'Erro ao atualizar cliente.';
          this.snackBar.open(msg, 'Fechar', { duration: 5000 });
        }
      });
    } else {
      this.clientService.create(formValue).subscribe({
        next: () => {
          this.snackBar.open('Cliente cadastrado com sucesso.', 'OK', { duration: 3000 });
          this.saving = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.saving = false;
          const msg = err.error?.error || 'Erro ao cadastrar cliente.';
          this.snackBar.open(msg, 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
