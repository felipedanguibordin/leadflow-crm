import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface LeadDialogData {
  mode: 'create' | 'edit';
  title: string;
  status: string;
}

export interface LeadDialogResult {
  title: string;
  status: string;
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'] as const;

@Component({
  selector: 'app-lead-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New lead' : 'Edit lead' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="title" minlength="2" maxlength="255" required />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="status">
          @for (s of statuses; track s) {
            <mat-option [value]="s">{{ s }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="title.length < 2" (click)="save()">
        {{ data.mode === 'create' ? 'Create' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      mat-dialog-content {
        min-width: 320px;
      }
    `,
  ],
})
export class LeadDialogComponent {
  readonly dialogRef = inject(MatDialogRef<LeadDialogComponent>);
  readonly data: LeadDialogData = inject(MAT_DIALOG_DATA);
  readonly statuses = STATUSES;

  title = this.data.title;
  status = this.data.status;

  save(): void {
    this.dialogRef.close({ title: this.title, status: this.status });
  }
}
