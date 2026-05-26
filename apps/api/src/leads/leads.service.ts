import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Repository } from 'typeorm';
import { OrganizationsService } from '../organizations/organizations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationEventDto } from '../notifications/dto/notification-event.dto';
import type { CreateLeadDto } from './dto/create-lead.dto';
import type { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';

const TERMINAL: ReadonlySet<string> = new Set(['WON', 'LOST']);

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly repo: Repository<Lead>,
    @InjectQueue('emails')
    private readonly emailQueue: Queue,
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
    private readonly organizations: OrganizationsService,
    private readonly notifications: NotificationsService,
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
    const saved = await this.repo.save(row);

    // Enqueue email notification
    await this.emailQueue.add(
      'lead-created',
      {
        organizationId,
        leadId: saved.id,
        title: saved.title,
        to: 'team@example.com', // TODO: Get from org settings
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    // Emit real-time notification via WebSocket
    const notification = new NotificationEventDto(
      'lead:created',
      organizationId,
      {
        leadId: saved.id,
        title: saved.title,
        status: saved.status,
        createdAt: saved.createdAt,
      },
    );
    this.notifications.broadcastToOrganization(organizationId, notification);

    return saved;
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
