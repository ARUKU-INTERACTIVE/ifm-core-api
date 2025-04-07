import { Auction } from '@module/auction/domain/auction.domain';
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
  metadataCid: string;

  @ApiProperty()
  imageCid: string;

  @ApiProperty()
  issuer: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;

  @ApiPropertyOptional()
  owner?: User;

  @ApiPropertyOptional()
  isInAuction?: boolean;

  @ApiPropertyOptional()
  auctions?: Auction[];
}
