import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'KPIs for dashboard charts (leads/month, conversion, delinquency, active users)',
  })
  dashboard(@Query() query: DashboardQueryDto) {
    return this.analytics.getDashboard(query.organizationId);
  }
}
