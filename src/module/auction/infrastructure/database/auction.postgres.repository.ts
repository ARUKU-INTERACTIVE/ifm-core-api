import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { AuctionStatus } from '@module/auction/application/enum/auction-status.enum';
import { IGetAllAuctionsOptions } from '@module/auction/application/interface/get-all-auctions-options.interface';
import { IAuctionRepository } from '@module/auction/application/repository/auction.repository.interface';
import { Auction } from '@module/auction/domain/auction.domain';
import { AuctionSchema } from '@module/auction/infrastructure/database/auction.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Not, Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';

export class AuctionRepository implements IAuctionRepository {
  constructor(
    @InjectRepository(AuctionSchema)
    private readonly repository: Repository<Auction>,
  ) {}

  async getAll(options: IGetAllAuctionsOptions): Promise<ICollection<Auction>> {
    const {
      filter: { excludeCompleted = true, ...filter },
      page,
      sort,
      fields,
      include,
    } = options || {};
    const whereClause: FindOptionsWhere<Auction> = { ...filter };

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (typeof value === 'string') {
          whereClause[key] = ILike(`%${value}%`);
        } else {
          whereClause[key] = value;
        }
      });
    }

    if (excludeCompleted) {
      whereClause.status = Not(
        In([
          AuctionStatus.Completed,
          AuctionStatus.NFTTransferred,
          AuctionStatus.Cancelled,
        ]),
      );
    }

    const [items, itemCount] = await this.repository.findAndCount({
      where: whereClause,
      order: sort,
      select: fields,
      take: page?.size,
      skip: page?.offset,
      relations: include,
    });
    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

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
