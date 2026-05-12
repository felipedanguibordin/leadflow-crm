import { PercentPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

interface Organization {
  id: string;
  name: string;
}

interface DashboardMetrics {
  leadsPerMonth: { month: string; count: number }[];
  conversion: { won: number; lost: number; rate: number };
  pipeline: { open: number; won: number; lost: number };
  finance: {
    organizationsWithPendingPayables: number;
    pendingPayables: number;
    overduePayables: number;
  };
  activeUsersLast30Days: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    PercentPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organizations = signal<Organization[]>([]);
  readonly selectedOrgId = signal<string | null>(null);
  readonly metrics = signal<DashboardMetrics | null>(null);

  readonly lineChartType = 'line' as const;
  readonly lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  readonly doughnutChartType = 'doughnut' as const;
  readonly doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  readonly lineData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  readonly doughnutData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });

  readonly conversionRatePct = computed(() => this.metrics()?.conversion.rate ?? 0);

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
    const dashUrl = `/api/v1/analytics/dashboard?organizationId=${encodeURIComponent(oid)}`;
    this.http.get<DashboardMetrics>(dashUrl).subscribe({
      next: (metrics) => {
        this.metrics.set(metrics);
        this.lineData.set({
          labels: metrics.leadsPerMonth.map((x) => x.month),
          datasets: [
            {
              label: 'Leads created',
              data: metrics.leadsPerMonth.map((x) => x.count),
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.15)',
              tension: 0.25,
              fill: true,
            },
          ],
        });
        const { open, won, lost } = metrics.pipeline;
        this.doughnutData.set({
          labels: ['Won', 'Lost', 'Open / in progress'],
          datasets: [
            {
              data: [won, lost, open],
              backgroundColor: ['#2e7d32', '#c62828', '#5c6bc0'],
            },
          ],
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard metrics.');
        this.loading.set(false);
      },
    });
  }
}
