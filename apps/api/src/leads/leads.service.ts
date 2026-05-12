import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationsService } from '../organizations/organizations.service';
import type { CreateLeadDto } from './dto/create-lead.dto';
import type { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';

const TERMINAL: ReadonlySet<string> = new Set(['WON', 'LOST']);

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly repo: Repository<Lead>,
    private readonly organizations: OrganizationsService,
  ) {}

  async list(organizationId: string): Promise<Lead[]> {
    await this.organizations.findOne(organizationId);
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(organizationId: string, dto: CreateLeadDto): Promise<Lead> {
    await this.organizations.findOne(organizationId);
    const status = dto.status ?? 'NEW';
    const row = this.repo.create({
      organizationId,
      title: dto.title,
      status,
      closedAt: TERMINAL.has(status) ? new Date() : null,
    });
    return this.repo.save(row);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateLeadDto,
  ): Promise<Lead> {
    const row = await this.repo.findOne({ where: { id, organizationId } });
    if (!row) {
      throw new NotFoundException('Lead not found.');
    }
    if (dto.title !== undefined) {
      row.title = dto.title;
    }
    if (dto.status !== undefined) {
      row.status = dto.status;
      row.closedAt = TERMINAL.has(dto.status)
        ? (row.closedAt ?? new Date())
        : null;
    }
    return this.repo.save(row);
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const res = await this.repo.delete({ id, organizationId });
    if (!res.affected) {
      throw new NotFoundException('Lead not found.');
    }
  }
}
