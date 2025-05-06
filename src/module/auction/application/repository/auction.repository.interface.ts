import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { IGetAllAuctionsOptions } from '@module/auction/application/interface/get-all-auctions-options.interface';
import { Auction } from '@module/auction/domain/auction.domain';

import { ICollection } from '@common/base/application/dto/collection.interface';

export const AUCTION_REPOSITORY_KEY = 'auction_repository';

export interface IAuctionRepository {
  getAll(options: IGetAllAuctionsOptions): Promise<ICollection<Auction>>;
  getOneById(id: number, relations?: AuctionRelation[]): Promise<Auction>;
  saveOne(auction: Auction, relations?: AuctionRelation[]): Promise<Auction>;
}
