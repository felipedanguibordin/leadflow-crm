import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PayableDocumentType } from '../entities/payable.entity';

export class CreatePayableDto {
  @ApiProperty({ enum: ['BOLETO', 'INVOICE'] })
  @IsIn(['BOLETO', 'INVOICE'])
  documentType!: PayableDocumentType;

  @ApiProperty({ example: 150000, description: 'Amount in cents (BRL)' })
  @IsInt()
  @Min(1)
  amountCents!: number;

  @ApiProperty({ example: '2026-06-01' })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  dueDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  externalReference?: string;
}
