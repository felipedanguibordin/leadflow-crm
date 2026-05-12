import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, type Repository } from 'typeorm';
import { Payable } from '../finance/entities/payable.entity';
import { Lead } from '../leads/entities/lead.entity';
import { WorkspaceUser } from '../users/entities/workspace-user.entity';

export type DashboardMetrics = {
  leadsPerMonth: { month: string; count: number }[];
  conversion: { won: number; lost: number; rate: number };
  pipeline: { open: number; won: number; lost: number };
  finance: {
    organizationsWithPendingPayables: number;
    pendingPayables: number;
    overduePayables: number;
  };
  activeUsersLast30Days: number;
};

function ym(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leads: Repository<Lead>,
    @InjectRepository(Payable)
    private readonly payables: Repository<Payable>,
    @InjectRepository(WorkspaceUser)
    private readonly workspaceUsers: Repository<WorkspaceUser>,
  ) {}

  async getDashboard(organizationId?: string): Promise<DashboardMetrics> {
    const leadWhere = organizationId ? { organizationId } : {};
    const leads = await this.leads.find({ where: leadWhere });

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 11);
    cutoff.setDate(1);
    cutoff.setHours(0, 0, 0, 0);

    const monthCounts = new Map<string, number>();
    for (const l of leads) {
      if (l.createdAt < cutoff) {
        continue;
      }
      const key = ym(l.createdAt);
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
    const leadsPerMonth = [...monthCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    const won = leads.filter((l) => l.status === 'WON').length;
    const lost = leads.filter((l) => l.status === 'LOST').length;
    const open = leads.filter(
      (l) => l.status !== 'WON' && l.status !== 'LOST',
    ).length;
    const denom = won + lost;
    const rate = denom === 0 ? 0 : Math.round((10000 * won) / denom) / 10000;

    const payableWhere = organizationId
      ? { organizationId, status: 'PENDING' as const }
      : { status: 'PENDING' as const };
    const pendingRows = await this.payables.find({ where: payableWhere });
    const now = new Date();
    const overduePayables = pendingRows.filter(
      (p) => new Date(p.dueDate) < now,
    ).length;
    const orgSet = new Set(pendingRows.map((p) => p.organizationId));

    const since = new Date(Date.now() - 30 * 86400000);
    const userWhere = organizationId
      ? { organizationId, lastActiveAt: MoreThan(since) }
      : { lastActiveAt: MoreThan(since) };
    const activeUsersLast30Days = await this.workspaceUsers.count({
      where: userWhere,
    });

    return {
      leadsPerMonth,
      conversion: { won, lost, rate },
      pipeline: { open, won, lost },
      finance: {
        organizationsWithPendingPayables: orgSet.size,
        pendingPayables: pendingRows.length,
        overduePayables,
      },
      activeUsersLast30Days,
    };
  }
}
