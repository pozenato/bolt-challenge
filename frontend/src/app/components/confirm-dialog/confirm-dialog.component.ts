import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon [color]="data.color || 'primary'" class="title-icon">warning</mat-icon>
        <span>{{ data.title }}</span>
      </h2>
      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()" class="btn-cancel">{{ data.cancelText || 'Cancelar' }}</button>
        <button mat-raised-button [color]="data.color || 'primary'" (click)="onConfirm()" class="btn-confirm">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog-container {
      padding: 8px;
    }
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }
    .title-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .dialog-content {
      font-size: 15px;
      color: #555;
      margin: 16px 0;
      line-height: 1.4;
    }
    .dialog-actions {
      padding-top: 8px;
      gap: 8px;
    }
    .btn-confirm {
      font-weight: 500;
    }
    .btn-cancel {
      color: #666;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
