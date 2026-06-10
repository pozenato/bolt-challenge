import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.css']
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];
  displayedColumns: string[] = ['nome', 'documento', 'createdAt', 'updatedAt', 'ativo', 'acoes'];
  loading = false;
  recentes = true;

  constructor(
    private clienteService: ClienteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.loading = true;
    this.clienteService.listar(this.recentes).subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erro ao carregar lista de clientes.', 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        this.loading = false;
      }
    });
  }

  onToggleChange(value: boolean): void {
    this.recentes = value;
    this.carregarClientes();
  }

  abrirFormulario(cliente?: Cliente): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { cliente: cliente }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarClientes();
      }
    });
  }

  deletarCliente(cliente: Cliente): void {
    if (confirm(`Tem certeza que deseja inativar o cliente ${cliente.nome}?`)) {
      this.clienteService.deletar(cliente.id!).subscribe({
        next: () => {
          this.snackBar.open('Cliente inativado com sucesso.', 'OK', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.carregarClientes();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.error || 'Erro ao deletar cliente.';
          this.snackBar.open(msg, 'Fechar', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  formatDocumento(doc: string): string {
    if (!doc) return '';
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  }
}
