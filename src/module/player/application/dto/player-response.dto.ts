import { PLAYER_ENTITY_NAME } from '@module/player/domain/player.name';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@sentry/nestjs';

import { EntityName } from '@common/decorators/entity-name.decorator';

@EntityName(PLAYER_ENTITY_NAME)
export class PlayerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  metadataUri: string;

  @ApiProperty()
  issuer: string;

  @ApiProperty()
  externalId: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;

  @ApiPropertyOptional()
  owner?: User;
}
