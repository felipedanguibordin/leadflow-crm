import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';
import type { CreatePayableDto } from './dto/create-payable.dto';
import { Payable } from './entities/payable.entity';

@Injectable()
export class PayablesService {
  constructor(
    @InjectRepository(Payable)
    private readonly repo: Repository<Payable>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async listByOrganization(organizationId: string): Promise<Payable[]> {
    await this.ensureOrg(organizationId);
    return this.repo.find({
      where: { organizationId },
      order: { dueDate: 'DESC' },
    });
  }

  async create(
    organizationId: string,
    dto: CreatePayableDto,
  ): Promise<Payable> {
    await this.ensureOrg(organizationId);
    const row = this.repo.create({
      organizationId,
      documentType: dto.documentType,
      status: 'PENDING',
      amountCents: dto.amountCents,
      dueDate: dto.dueDate,
      externalReference: dto.externalReference ?? null,
    });
    return this.repo.save(row);
  }

  async settlePaid(
    organizationId: string,
    payableId: string,
  ): Promise<Payable> {
    const row = await this.repo.findOne({
      where: { id: payableId, organizationId },
    });
    if (!row) {
      throw new NotFoundException('Payable not found for this organization.');
    }
    row.status = 'PAID';
    return this.repo.save(row);
  }

  private async ensureOrg(id: string): Promise<void> {
    const exists = await this.orgRepo.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Organization not found.');
    }
  }
}
