import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  LeadDialogComponent,
  type LeadDialogData,
  type LeadDialogResult,
} from './lead-dialog.component';

interface Organization {
  id: string;
  name: string;
}

interface Lead {
  id: string;
  organizationId: string;
  title: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
}

@Component({
  selector: 'app-leads',
  imports: [
    DatePipe,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss',
})
export class LeadsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organizations = signal<Organization[]>([]);
  readonly selectedOrgId = signal<string | null>(null);
  readonly leads = signal<Lead[]>([]);
  readonly displayedColumns = ['title', 'status', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.http
      .get<Organization[]>('/api/v1/organizations')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orgs) => {
          this.organizations.set(orgs);
          const first = orgs[0]?.id ?? null;
          this.selectedOrgId.set(first);
          if (first) {
            this.refresh(first);
          } else {
            this.loading.set(false);
          }
        },
        error: () => {
          this.error.set('Could not load organizations. Is the API running?');
          this.loading.set(false);
        },
      });
  }

  onOrgChange(id: string): void {
    this.selectedOrgId.set(id);
    this.refresh(id);
  }

  refresh(organizationId?: string | null): void {
    const oid = organizationId ?? this.selectedOrgId();
    if (!oid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Lead[]>(`/api/v1/organizations/${oid}/leads`).subscribe({
      next: (rows) => {
        this.leads.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load leads.');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    const data: LeadDialogData = { mode: 'create', title: '', status: 'NEW' };
    const ref = this.dialog.open(LeadDialogComponent, { data });
    ref.afterClosed().subscribe((result: LeadDialogResult | undefined) => {
      if (!result) {
        return;
      }
      const oid = this.selectedOrgId();
      if (!oid) {
        return;
      }
      this.http.post<Lead>(`/api/v1/organizations/${oid}/leads`, result).subscribe({
        next: () => {
          this.snackBar.open('Lead created', 'OK', { duration: 3000 });
          this.refresh();
        },
        error: () => this.snackBar.open('Failed to create lead', 'OK', { duration: 4000 }),
      });
    });
  }

  openEdit(lead: Lead): void {
    const data: LeadDialogData = {
      mode: 'edit',
      title: lead.title,
      status: lead.status,
    };
    const ref = this.dialog.open(LeadDialogComponent, { data });
    ref.afterClosed().subscribe((result: LeadDialogResult | undefined) => {
      if (!result) {
        return;
      }
      const oid = this.selectedOrgId();
      if (!oid) {
        return;
      }
      this.http.patch<Lead>(`/api/v1/organizations/${oid}/leads/${lead.id}`, result).subscribe({
        next: () => {
          this.snackBar.open('Lead updated', 'OK', { duration: 3000 });
          this.refresh();
        },
        error: () => this.snackBar.open('Failed to update lead', 'OK', { duration: 4000 }),
      });
    });
  }

  confirmDelete(lead: Lead): void {
    const confirmed = window.confirm(`Delete "${lead.title}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }
    const oid = this.selectedOrgId();
    if (!oid) {
      return;
    }
    this.http.delete(`/api/v1/organizations/${oid}/leads/${lead.id}`).subscribe({
      next: () => {
        this.snackBar.open('Lead deleted', 'OK', { duration: 3000 });
        this.refresh();
      },
      error: () => this.snackBar.open('Failed to delete lead', 'OK', { duration: 4000 }),
    });
  }
}
