import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../organizations/entities/organization.entity';
import { DelinquencyContextMiddleware } from './delinquency-context.middleware';
import { DelinquencyGuard } from './delinquency.guard';
import { Payable } from './entities/payable.entity';
import { FinancialComplianceService } from './financial-compliance.service';
import { PayablesController } from './payables.controller';
import { PayablesService } from './payables.service';
import { DefaultDelinquencyPolicy } from './rules/default-delinquency.policy';
import { DELINQUENCY_POLICY } from './rules/delinquency-policy.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Payable, Organization])],
  controllers: [PayablesController],
  providers: [
    PayablesService,
    FinancialComplianceService,
    DelinquencyGuard,
    DelinquencyContextMiddleware,
    DefaultDelinquencyPolicy,
    { provide: DELINQUENCY_POLICY, useExisting: DefaultDelinquencyPolicy },
  ],
  exports: [
    TypeOrmModule,
    FinancialComplianceService,
    DelinquencyGuard,
    DelinquencyContextMiddleware,
    DefaultDelinquencyPolicy,
    DELINQUENCY_POLICY,
  ],
})
export class FinanceModule {}
