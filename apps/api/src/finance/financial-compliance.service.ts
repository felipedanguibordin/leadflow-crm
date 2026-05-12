import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  DELINQUENCY_POLICY,
  type DelinquencyPolicy,
} from './rules/delinquency-policy.interface';
import type { DelinquencySnapshot } from './delinquency.types';

/** Central entry point for financial gates (guards, middleware, jobs). */
@Injectable()
export class FinancialComplianceService {
  constructor(
    @Inject(DELINQUENCY_POLICY)
    private readonly delinquencyPolicy: DelinquencyPolicy,
  ) {}

  snapshot(organizationId: string): Promise<DelinquencySnapshot> {
    return this.delinquencyPolicy.evaluate(organizationId);
  }

  async assertOperationsAllowed(organizationId: string): Promise<void> {
    const snap = await this.snapshot(organizationId);
    if (snap.blocked) {
      throw new ForbiddenException({
        error: 'DELINQUENCY_BLOCK',
        message:
          'This organization has pending financial documents. New operations are blocked until they are paid or cancelled.',
        reasons: snap.reasons,
        pendingPayables: snap.pendingPayables,
        overduePayables: snap.overduePayables,
      });
    }
  }
}
