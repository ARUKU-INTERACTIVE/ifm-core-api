import { CreateFormationPlayerUuidDto } from '@module/formation-player/application/dto/create-formation-player.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ICreateFormationDto } from '@/module/formation/application/dto/create-formation.dto.interface';

export class CreateFormationDto implements ICreateFormationDto {
  @ApiPropertyOptional({ type: String, example: 'Attack' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: 'That formation is for going on the offensive.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  rosterUuid: string;

  @ApiPropertyOptional({ type: Number, example: 3 })
  @IsNumber()
  @IsNotEmpty()
  forwards: number;

  @ApiPropertyOptional({ type: Boolean, example: false })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiPropertyOptional({ type: Number, example: 3 })
  @IsNumber()
  @IsNotEmpty()
  midfielders: number;

  @ApiPropertyOptional({ type: Number, example: 4 })
  @IsNumber()
  @IsNotEmpty()
  defenders: number;

  @ApiPropertyOptional({ type: Array })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormationPlayerUuidDto)
  formationPlayers: CreateFormationPlayerUuidDto[];
}
