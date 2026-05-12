import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): Record<string, unknown> {
    return {
      name: 'LeadFlow CRM API',
      version: '0.1.0',
      phase: 'Phase 1 — base infrastructure',
      docs: '/api/docs',
      health: '/api/v1/health',
    };
  }
}
