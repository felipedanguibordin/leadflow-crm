import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceUserDto {
  @ApiProperty({ example: 'Maria (SDR)' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  displayName!: string;
}
