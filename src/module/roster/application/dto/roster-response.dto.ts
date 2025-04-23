import { Player } from '@module/player/domain/player.domain';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { DtoProperty } from '@common/base/application/dto/base.dto';
import { EntityName } from '@common/decorators/entity-name.decorator';

import { ROSTER_ENTITY_NAME } from '@/module/roster/domain/roster.name';

@EntityName(ROSTER_ENTITY_NAME)
export class RosterResponseDto {
  @DtoProperty
  @IsInt()
  id: number;

  @DtoProperty
  @IsString()
  @IsOptional()
  uuid?: string;

  @DtoProperty
  @IsNumber()
  teamId: number;

  @DtoProperty
  @ValidateNested({ each: true })
  @Type(() => Player)
  players: Player[];

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
