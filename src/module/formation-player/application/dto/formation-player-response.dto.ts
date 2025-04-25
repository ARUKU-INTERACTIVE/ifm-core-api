import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

import { DtoProperty } from '@common/base/application/dto/base.dto';
import { EntityName } from '@common/decorators/entity-name.decorator';

import { FORMATION_PLAYER_ENTITY_NAME } from '@/module/formation-player/domain/formation-player.name';

@EntityName(FORMATION_PLAYER_ENTITY_NAME)
export class PlayerFormationResponseDto {
  @DtoProperty
  @IsInt()
  id: number;

  @DtoProperty
  @IsString()
  @IsOptional()
  uuid?: string;

  @DtoProperty
  @IsDate()
  createdAt: string;

  @DtoProperty
  @IsOptional()
  @Type(() => PlayerResponseDto)
  player: PlayerResponseDto;

  @DtoProperty
  @IsDate()
  updatedAt: string;

  @DtoProperty
  @IsDate()
  @IsOptional()
  deletedAt?: string;
}
