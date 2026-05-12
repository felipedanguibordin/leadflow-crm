import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  template: `
    <section class="wrap">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>LeadFlow CRM</mat-card-title>
          <mat-card-subtitle
            >Enterprise lead &amp; distributor ops — Angular, NestJS, PostgreSQL,
            Redis.</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content>
          <p>
            Use the <strong>Dashboard</strong> for KPIs (leads/month, conversion, delinquency,
            active users). Writes to the lead pipeline are blocked automatically when the tenant has
            pending boletos until finance settles them.
          </p>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-raised-button color="primary" routerLink="/dashboard">Open dashboard</a>
        </mat-card-actions>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .wrap {
        max-width: 720px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
    `,
  ],
})
export class HomeComponent {}
