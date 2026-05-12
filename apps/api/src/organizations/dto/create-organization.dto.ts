import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Distribuidora Sul' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;
}
