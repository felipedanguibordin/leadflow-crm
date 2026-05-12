import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly title = signal('LeadFlow CRM');
  readonly apiStatus = signal<'unknown' | 'ok' | 'error'>('unknown');

  ngOnInit() {
    this.http.get<{ name: string }>('/api/v1').subscribe({
      next: (res) => {
        if (res?.name) {
          this.apiStatus.set('ok');
        }
      },
      error: () => this.apiStatus.set('error'),
    });
  }
}
