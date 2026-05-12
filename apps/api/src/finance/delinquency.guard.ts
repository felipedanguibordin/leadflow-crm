import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { FinancialComplianceService } from './financial-compliance.service';

/** Blocks mutating routes when the tenant has pending boletos/invoices. */
@Injectable()
export class DelinquencyGuard implements CanActivate {
  constructor(private readonly compliance: FinancialComplianceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<{ params: Record<string, string> }>();
    const organizationId = req.params['organizationId'];
    if (!organizationId) {
      throw new BadRequestException('Missing organizationId in route.');
    }
    await this.compliance.assertOperationsAllowed(organizationId);
    return true;
  }
}
