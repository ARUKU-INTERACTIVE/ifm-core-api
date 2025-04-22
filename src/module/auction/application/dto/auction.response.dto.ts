import { AuctionStatus } from '@module/auction/application/enum/auction-status.enum';
import { AUCTION_ENTITY_NAME } from '@module/auction/domain/auction.name';
import { Player } from '@module/player/domain/player.domain';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { EntityName } from '@common/decorators/entity-name.decorator';

@EntityName(AUCTION_ENTITY_NAME)
export class AuctionResponseDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  externalId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  highestBidAmount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  endTime: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  startTime: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Player)
  player: Player;

  @ApiProperty()
  @IsEnum(AuctionStatus)
  @IsNotEmpty()
  status: AuctionStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  highestBidderAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  playerAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  updatedAt: string;

  @ApiPropertyOptional()
  @IsString()
  deletedAt?: string;
}
