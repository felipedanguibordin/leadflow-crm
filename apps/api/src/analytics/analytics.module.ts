import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payable } from '../finance/entities/payable.entity';
import { Lead } from '../leads/entities/lead.entity';
import { WorkspaceUser } from '../users/entities/workspace-user.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Payable, WorkspaceUser])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
