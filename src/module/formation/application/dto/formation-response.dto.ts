import { FormationPlayerResponseDto } from '@module/formation-player/application/dto/formation-player-response.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { DtoProperty } from '@common/base/application/dto/base.dto';
import { EntityName } from '@common/decorators/entity-name.decorator';

import { FORMATION_ENTITY_NAME } from '@/module/formation/domain/formation.name';

@EntityName(FORMATION_ENTITY_NAME)
export class FormationResponseDto {
  @DtoProperty
  @IsInt()
  id: number;

  @DtoProperty
  @IsString()
  @IsOptional()
  uuid?: string;

  @DtoProperty
  @IsString()
  forwards: number;

  @DtoProperty
  @IsString()
  midfielders: number;

  @DtoProperty
  @IsString()
  defenders: number;

  @DtoProperty
  @IsString()
  name: string;

  @DtoProperty
  @IsArray()
  @Type(() => FormationPlayerResponseDto)
  formationPlayers: FormationPlayerResponseDto[];

  @DtoProperty
  @IsBoolean()
  isActive: boolean;

  @DtoProperty
  @IsDate()
  createdAt: string;

  @DtoProperty
  @IsDate()
  updatedAt: string;

  @DtoProperty
  @IsDate()
  @IsOptional()
  deletedAt?: string;
}
