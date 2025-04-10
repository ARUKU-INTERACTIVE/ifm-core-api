import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { IAuctionRepository } from '@module/auction/application/repository/auction.repository.interface';
import { Auction } from '@module/auction/domain/auction.domain';
import { AuctionSchema } from '@module/auction/infrastructure/database/auction.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class AuctionRepository implements IAuctionRepository {
  constructor(
    @InjectRepository(AuctionSchema)
    private readonly repository: Repository<Auction>,
  ) {}

  async getOneById(
    id: number,
    relations?: AuctionRelation[],
  ): Promise<Auction> {
    return await this.repository.findOne({
      where: {
        id,
      },
      relations,
    });
  }

  async saveOne(
    auction: Auction,
    relations?: AuctionRelation[],
  ): Promise<Auction> {
    const savedAuction = await this.repository.save(auction);

    return await this.repository.findOne({
      where: {
        id: savedAuction.id,
      },
      relations,
    });
  }
}
