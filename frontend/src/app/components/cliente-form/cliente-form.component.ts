import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, UnidadeConsumidora } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
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
    NgxMaskDirective
  ],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnInit {
  clienteForm!: FormGroup;
  isEditMode = false;
  loadingCep = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ClienteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cliente?: Cliente }
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.cliente;
    this.initForm();
    if (this.isEditMode && this.data.cliente) {
      this.populateForm(this.data.cliente);
    }
  }

  private initForm(): void {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      documento: ['', [Validators.required, Validators.pattern(/^\d{11}$|^\d{14}$/)]],
      enderecoCliente: this.fb.group({
        cep: ['', [Validators.required]],
        logradouro: [{ value: '', disabled: true }],
        bairro: [{ value: '', disabled: true }],
        localidade: [{ value: '', disabled: true }],
        uf: [{ value: '', disabled: true }],
        numero: ['', [Validators.required]],
        complemento: ['']
      }),
      unidadesConsumidoras: this.fb.array([])
    });

    // Listen to document input changes to normalize validation pattern
    this.clienteForm.get('documento')?.valueChanges.subscribe(val => {
      if (val) {
        const clean = val.replace(/\D/g, '');
        if (clean.length !== 11 && clean.length !== 14) {
          this.clienteForm.get('documento')?.setErrors({ invalidLength: true });
        } else {
          // Force pattern reevaluation on clean string
          if (this.clienteForm.get('documento')?.hasError('invalidLength')) {
            this.clienteForm.get('documento')?.setErrors(null);
          }
        }
      }
    });
  }

  get unidadesConsumidoras(): FormArray {
    return this.clienteForm.get('unidadesConsumidoras') as FormArray;
  }

  private populateForm(cliente: Cliente): void {
    this.clienteForm.patchValue({
      nome: cliente.nome,
      documento: cliente.documento,
      enderecoCliente: {
        cep: cliente.enderecoCliente.cep,
        logradouro: cliente.enderecoCliente.logradouro,
        bairro: cliente.enderecoCliente.bairro,
        localidade: cliente.enderecoCliente.localidade,
        uf: cliente.enderecoCliente.uf,
        numero: cliente.enderecoCliente.numero,
        complemento: cliente.enderecoCliente.complemento
      }
    });

    if (cliente.unidadesConsumidoras) {
      cliente.unidadesConsumidoras.forEach(uc => {
        this.addUnidadeConsumidora(uc);
      });
    }
  }

  createUnidadeGroup(uc?: UnidadeConsumidora): FormGroup {
    return this.fb.group({
      id: [uc ? uc.id : null],
      nome: [uc ? uc.nome : '', [Validators.required]],
      numeroInstalacao: [uc ? uc.numeroInstalacao : '', [Validators.required]],
      endereco: this.fb.group({
        cep: [uc ? uc.endereco.cep : '', [Validators.required]],
        logradouro: [{ value: uc ? uc.endereco.logradouro : '', disabled: true }],
        bairro: [{ value: uc ? uc.endereco.bairro : '', disabled: true }],
        localidade: [{ value: uc ? uc.endereco.localidade : '', disabled: true }],
        uf: [{ value: uc ? uc.endereco.uf : '', disabled: true }],
        numero: [uc ? uc.endereco.numero : '', [Validators.required]],
        complemento: [uc ? uc.endereco.complemento : '']
      })
    });
  }

  addUnidadeConsumidora(uc?: UnidadeConsumidora): void {
    this.unidadesConsumidoras.push(this.createUnidadeGroup(uc));
  }

  removeUnidadeConsumidora(index: number): void {
    this.unidadesConsumidoras.removeAt(index);
  }

  buscarCepCliente(): void {
    const cepControl = this.clienteForm.get('enderecoCliente.cep');
    if (!cepControl || cepControl.invalid) return;

    const cep = cepControl.value.replace(/\D/g, '');
    if (cep.length === 8) {
      this.loadingCep = true;
      this.clienteService.consultarCep(cep).subscribe({
        next: (res) => {
          if (res.erro) {
            this.snackBar.open('CEP não encontrado.', 'OK', { duration: 3000 });
            this.resetEnderecoGroup(this.clienteForm.get('enderecoCliente') as FormGroup);
          } else {
            this.clienteForm.get('enderecoCliente')?.patchValue({
              logradouro: res.logradouro,
              bairro: res.bairro,
              localidade: res.localidade,
              uf: res.uf
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

  buscarCepUnidade(index: number): void {
    const ucGroup = this.unidadesConsumidoras.at(index) as FormGroup;
    const cepControl = ucGroup.get('endereco.cep');
    if (!cepControl || cepControl.invalid) return;

    const cep = cepControl.value.replace(/\D/g, '');
    if (cep.length === 8) {
      this.clienteService.consultarCep(cep).subscribe({
        next: (res) => {
          if (res.erro) {
            this.snackBar.open('CEP da unidade não encontrado.', 'OK', { duration: 3000 });
            this.resetEnderecoGroup(ucGroup.get('endereco') as FormGroup);
          } else {
            const ufUpper = res.uf.toUpperCase();
            if (ufUpper === 'SP' || ufUpper === 'RS' || ufUpper === 'PR') {
              this.snackBar.open(`Não atendemos a região do estado de ${ufUpper}.`, 'Atenção', {
                duration: 5000,
                panelClass: ['snackbar-warning']
              });
              cepControl.setErrors({ unservicedRegion: true });
              this.resetEnderecoGroup(ucGroup.get('endereco') as FormGroup);
            } else {
              if (cepControl.hasError('unservicedRegion')) {
                cepControl.setErrors(null);
              }
              ucGroup.get('endereco')?.patchValue({
                logradouro: res.logradouro,
                bairro: res.bairro,
                localidade: res.localidade,
                uf: res.uf
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

  private resetEnderecoGroup(group: FormGroup): void {
    group.patchValue({
      logradouro: '',
      bairro: '',
      localidade: '',
      uf: ''
    });
  }

  salvar(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    // Para enviar dados, precisamos obter os valores, incluindo os desabilitados (logradouro, bairro, etc.)
    const formValue = this.clienteForm.getRawValue();
    
    // Limpa máscaras dos valores antes de enviar ao backend
    formValue.documento = formValue.documento.replace(/\D/g, '');
    formValue.enderecoCliente.cep = formValue.enderecoCliente.cep.replace(/\D/g, '');
    if (formValue.unidadesConsumidoras) {
      formValue.unidadesConsumidoras.forEach((uc: any) => {
        uc.endereco.cep = uc.endereco.cep.replace(/\D/g, '');
      });
    }

    this.saving = true;
    if (this.isEditMode) {
      this.clienteService.atualizar(this.data.cliente!.id!, formValue).subscribe({
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
      this.clienteService.cadastrar(formValue).subscribe({
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

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
