import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Scope metrics to one distributor tenant',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
