import { AuctionFilterQueryParamsDto } from '@module/auction/application/dto/params/auction-filter-query-params.dto';
import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { Auction } from '@module/auction/domain/auction.domain';

import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

export interface IGetAllAuctionsOptions
  extends IGetAllOptions<Auction, AuctionRelation[]> {
  filter: AuctionFilterQueryParamsDto;
}
