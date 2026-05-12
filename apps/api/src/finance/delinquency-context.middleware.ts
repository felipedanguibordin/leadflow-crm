import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { FinancialComplianceService } from './financial-compliance.service';

/**
 * Attaches a read-only delinquency snapshot to the request for logging, auditing,
 * or downstream handlers — enforcement stays in {@link DelinquencyGuard}.
 */
@Injectable()
export class DelinquencyContextMiddleware implements NestMiddleware {
  constructor(private readonly compliance: FinancialComplianceService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const raw = req.params['organizationId'];
    const organizationId = Array.isArray(raw) ? raw[0] : raw;
    if (organizationId) {
      req.delinquency = await this.compliance.snapshot(organizationId);
    }
    next();
  }
}
