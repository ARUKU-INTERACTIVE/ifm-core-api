import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { Auction } from '@module/auction/domain/auction.domain';

export const AUCTION_REPOSITORY_KEY = 'auction_repository';

export interface IAuctionRepository {
  getOneById(id: number, relations?: AuctionRelation[]): Promise<Auction>;
  saveOne(auction: Auction, relations?: AuctionRelation[]): Promise<Auction>;
}
