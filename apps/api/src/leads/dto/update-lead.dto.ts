import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { LeadPipelineStatus } from '../entities/lead.types';

export class UpdateLeadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'],
  })
  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'])
  status?: LeadPipelineStatus;
}
