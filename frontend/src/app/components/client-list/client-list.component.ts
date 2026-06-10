import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { ClientFormComponent } from '../client-form/client-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
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
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  dataSource = new MatTableDataSource<Client>([]);
  displayedColumns: string[] = ['name', 'document', 'createdAt', 'updatedAt', 'active', 'actions'];
  loading = false;
  recent = true;

  filterValue = '';

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.dataSource.paginator = mp;
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.dataSource.sort = ms;
  }

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.list(this.recent).subscribe({
      next: (data) => {
        this.dataSource.data = data;
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
    this.recent = value;
    this.loadClients();
  }

  applyFilter(event: Event): void {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.filterValue = '';
    this.dataSource.filter = '';
  }

  openForm(client?: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { client: client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  deleteClient(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Inativação',
        message: `Tem certeza que deseja inativar o cliente "${client.name}"? O registro não será removido fisicamente.`,
        confirmText: 'Inativar',
        cancelText: 'Cancelar',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.clientService.delete(client.id!).subscribe({
          next: () => {
            this.snackBar.open('Cliente inativado com sucesso.', 'OK', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.loadClients();
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
    });
  }

  activateClient(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Ativação',
        message: `Tem certeza que deseja ativar o cliente "${client.name}"?`,
        confirmText: 'Ativar',
        cancelText: 'Cancelar',
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const updated = { ...client, active: true };
        this.clientService.update(client.id!, updated).subscribe({
          next: () => {
            this.snackBar.open('Cliente ativado com sucesso.', 'OK', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.loadClients();
          },
          error: (err) => {
            console.error(err);
            const msg = err.error?.error || 'Erro ao ativar cliente.';
            this.snackBar.open(msg, 'Fechar', {
              duration: 5000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }

  formatDocument(doc: string): string {
    if (!doc) return '';
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  }

  getAvatarInitial(name: string): string {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#64748b';
    const colors = [
      '#6366f1', // Indigo
      '#0d9488', // Teal
      '#10b981', // Emerald/Green
      '#f97316', // Orange
      '#ec4899', // Pink
      '#8b5cf6', // Purple
      '#f43f5e', // Rose
      '#f59e0b'  // Amber
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}
