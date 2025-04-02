import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { IPlayerRepository } from '@module/player/application/repository/player.repository.interface';
import { Player } from '@module/player/domain/player.domain';
import { PlayerSChema } from '@module/player/infrastructure/database/player.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

export class PlayerRepository implements IPlayerRepository {
  constructor(
    @InjectRepository(PlayerSChema)
    private readonly repository: Repository<Player>,
  ) {}

  async getAll(
    options: IGetAllOptions<Player, PlayerRelation[]>,
  ): Promise<ICollection<Player>> {
    const { filter, page, sort, fields, include } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: { ...filter },
      order: sort,
      select: fields,
      take: page.size,
      skip: page.offset,
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

  async getOneById(id: number, relations?: PlayerRelation[]): Promise<Player> {
    return await this.repository.findOne({
      where: {
        id,
      },
      relations,
    });
  }

  async saveOne(player: Player, relations?: PlayerRelation[]): Promise<Player> {
    const savedPlayer = await this.repository.save(player);

    return await this.repository.findOne({
      where: {
        id: savedPlayer.id,
      },
      relations,
    });
  }
}
