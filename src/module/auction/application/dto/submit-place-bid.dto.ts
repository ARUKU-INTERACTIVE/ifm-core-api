import { AUCTION_ENTITY_NAME } from '@module/auction/domain/auction.name';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { EntityName } from '@common/decorators/entity-name.decorator';

@EntityName(AUCTION_ENTITY_NAME)
export class SubmitPlaceBidDto {
  @IsString()
  @IsNotEmpty()
  xdr: string;

  @IsNumber()
  @IsNotEmpty()
  auctionId: number;
}
