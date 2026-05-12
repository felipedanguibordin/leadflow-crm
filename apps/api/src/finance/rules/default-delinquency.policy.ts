import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DelinquencySnapshot } from '../delinquency.types';
import { Payable } from '../entities/payable.entity';
import type { DelinquencyPolicy } from './delinquency-policy.interface';

/**
 * Default rule: any **PENDING** boleto/invoice blocks mutating business operations.
 * Overdue count is exposed for dashboards and collections prioritization.
 */
@Injectable()
export class DefaultDelinquencyPolicy implements DelinquencyPolicy {
  constructor(
    @InjectRepository(Payable)
    private readonly payables: Repository<Payable>,
  ) {}

  async evaluate(organizationId: string): Promise<DelinquencySnapshot> {
    const pending = await this.payables.find({
      where: { organizationId, status: 'PENDING' },
    });
    const now = new Date();
    const overduePayables = pending.filter(
      (p) => new Date(p.dueDate) < now,
    ).length;
    const blocked = pending.length > 0;
    const reasons: string[] = [];
    if (blocked) {
      reasons.push(
        overduePayables > 0
          ? 'Overdue pending payments must be settled before new operations.'
          : 'Pending payments (e.g. open boletos) must be settled before new operations.',
      );
    }
    return {
      organizationId,
      blocked,
      pendingPayables: pending.length,
      overduePayables,
      reasons,
    };
  }
}
