import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationsService } from '../organizations/organizations.service';
import type { CreateWorkspaceUserDto } from './dto/create-workspace-user.dto';
import { WorkspaceUser } from './entities/workspace-user.entity';

@Injectable()
export class WorkspaceUsersService {
  constructor(
    @InjectRepository(WorkspaceUser)
    private readonly repo: Repository<WorkspaceUser>,
    private readonly organizations: OrganizationsService,
  ) {}

  async list(organizationId: string): Promise<WorkspaceUser[]> {
    await this.organizations.findOne(organizationId);
    return this.repo.find({
      where: { organizationId },
      order: { displayName: 'ASC' },
    });
  }

  async create(
    organizationId: string,
    dto: CreateWorkspaceUserDto,
  ): Promise<WorkspaceUser> {
    await this.organizations.findOne(organizationId);
    const row = this.repo.create({
      organizationId,
      displayName: dto.displayName,
      isActive: true,
      lastActiveAt: new Date(),
    });
    return this.repo.save(row);
  }

  async ping(organizationId: string, userId: string): Promise<WorkspaceUser> {
    const row = await this.repo.findOne({
      where: { id: userId, organizationId },
    });
    if (!row) {
      throw new NotFoundException('Workspace user not found.');
    }
    row.lastActiveAt = new Date();
    return this.repo.save(row);
  }
}
