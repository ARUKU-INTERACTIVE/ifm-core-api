import { Auction } from '@module/auction/domain/auction.domain';
import { PLAYER_ENTITY_NAME } from '@module/player/domain/player.name';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EntityName } from '@common/decorators/entity-name.decorator';

@EntityName(PLAYER_ENTITY_NAME)
export class PlayerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  metadataUri: string;

  @ApiProperty()
  imageUri: string;

  @ApiProperty()
  issuer: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  teamId: number;

  @ApiProperty()
  rosterId: number;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;

  @ApiPropertyOptional()
  auctions?: Auction[];
}
