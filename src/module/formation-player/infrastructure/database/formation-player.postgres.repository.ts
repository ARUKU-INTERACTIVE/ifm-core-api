import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { FormationPlayerRelation } from '@/module/formation-player/application/enum/formation-player-relation.enum';
import { IPlayerFormationRepository } from '@/module/formation-player/application/repository/formation-player.repository.interface';
import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';
import { FormationPlayerNotFoundException } from '@/module/formation-player/infrastructure/database/exception/formation-player-not-found.exception';
import { FormationPlayerSchema } from '@/module/formation-player/infrastructure/database/formation-player.schema';

export class PlayerFormationPostgresRepository
  implements IPlayerFormationRepository
{
  constructor(
    @InjectRepository(FormationPlayerSchema)
    private readonly repository: Repository<FormationPlayer>,
  ) {}

  async getAll(
    options?: IGetAllOptions<
      FormationPlayer,
      Partial<FormationPlayerRelation[]>
    >,
  ): Promise<ICollection<FormationPlayer>> {
    const { filter, page, sort, fields, include } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: filter,
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

  async getOneByIdOrFail(
    id: number,
    relations: FormationPlayerRelation[] = [],
  ): Promise<FormationPlayer> {
    const FormationPlayer = await this.repository.findOne({
      where: { id },
      relations,
    });

    if (!FormationPlayer) {
      throw new FormationPlayerNotFoundException({
        message: `FormationPlayer with ID ${id} not found`,
      });
    }

    return FormationPlayer;
  }

  async getOneById(
    id: number,
    relations: FormationPlayerRelation[] = [],
  ): Promise<FormationPlayer> {
    return this.repository.findOne({
      where: { id },
      relations,
    });
  }

  async saveOne(
    formationPlayer: FormationPlayer,
    relations: FormationPlayerRelation[] = [],
  ): Promise<FormationPlayer> {
    const savedFormationPlayer = await this.repository.save(formationPlayer);
    return this.repository.findOne({
      where: { id: savedFormationPlayer.id },
      relations,
    });
  }

  async saveMany(
    formationPlayer: FormationPlayer[],
  ): Promise<FormationPlayer[]> {
    return await this.repository.save(formationPlayer);
  }

  async updateOneOrFail(
    id: number,
    updates: Partial<Omit<FormationPlayer, 'id'>>,
    relations: FormationPlayerRelation[] = [],
  ): Promise<FormationPlayer> {
    const formationPlayerToUpdate = await this.repository.preload({
      ...updates,
      id,
    });

    if (!formationPlayerToUpdate) {
      throw new FormationPlayerNotFoundException({
        message: `FormationPlayer with ID ${id} not found`,
      });
    }

    const savedFormationPlayer = await this.repository.save(
      formationPlayerToUpdate,
    );

    return this.repository.findOne({
      where: { id: savedFormationPlayer.id },
      relations,
    });
  }

  async deleteOneOrFail(id: number): Promise<void> {
    const formationPlayerToDelete = await this.repository.findOne({
      where: { id },
    });

    if (!formationPlayerToDelete) {
      throw new FormationPlayerNotFoundException({
        message: `FormationPlayerModule with ID ${id} not found`,
      });
    }

    await this.repository.softDelete({ id });
  }
}
