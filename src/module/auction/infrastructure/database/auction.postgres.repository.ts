import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { IPlayerRepository } from '@module/player/application/repository/player.repository.interface';
import { Player } from '@module/player/domain/player.domain';
import { PlayerSChema } from '@module/player/infrastructure/database/player.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { IAuctionRepository } from '@module/auction/application/repository/auction.repository.interface';
import { Auction } from '@module/auction/domain/auction.domain';
import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { AuctionSchema } from '@module/auction/infrastructure/database/auction.schema';

export class AuctionRepository implements IAuctionRepository {
  constructor(
    @InjectRepository(AuctionSchema)
    private readonly repository: Repository<Auction>,
  ) {}

  async getAll(
    options: IGetAllOptions<Auction, AuctionRelation[]>,
  ): Promise<ICollection<Auction>> {
    const { filter, page, sort, fields, include } = options || {};
    const whereClause = { ...filter };

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (typeof value === 'string') {
          whereClause[key] = ILike(`%${value}%`);
        } else {
          whereClause[key] = value;
        }
      });
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

  async getOneById(id: number, relations?: AuctionRelation[]): Promise<Auction> {
    return await this.repository.findOne({
      where: {
        id,
      },
      relations,
    });
  }

  async saveOne(auction: Auction, relations?: AuctionRelation[]): Promise<Auction> {
    const savedAuction = await this.repository.save(auction);

    return await this.repository.findOne({
      where: {
        id: savedAuction.id,
      },
      relations,
    });
  }
}
