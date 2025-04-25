import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ICreateRosterDto } from '@/module/roster/application/dto/create-roster.dto.interface';

export class CreateRosterDto implements ICreateRosterDto {
  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsString()
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsString()
  @IsNotEmpty()
  teamId: number;
}
