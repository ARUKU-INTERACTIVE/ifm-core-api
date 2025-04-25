import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { FormationRelation } from '@/module/formation/application/enum/formation-relation.enum';
import { IFormationRepository } from '@/module/formation/application/repository/formation.repository.interface';
import { Formation } from '@/module/formation/domain/formation.entity';
import { FormationNotFoundException } from '@/module/formation/infrastructure/database/exception/formation-not-found.exception';
import { FormationSchema } from '@/module/formation/infrastructure/database/formation.schema';

export class FormationPostgresRepository implements IFormationRepository {
  constructor(
    @InjectRepository(FormationSchema)
    private readonly repository: Repository<Formation>,
  ) {}

  async getAll(
    options?: IGetAllOptions<Formation, Partial<FormationRelation[]>>,
  ): Promise<ICollection<Formation>> {
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

  async getOneByUuidOrFail(uuid: string): Promise<Formation> {
    const formation = await this.repository.findOne({
      where: { uuid },
      relations: {
        formationPlayers: {
          player: true,
        },
      },
    });
    console.log(formation, 'formation');
    if (!formation) {
      throw new FormationNotFoundException({
        message: `Formation with UUID ${uuid} not found`,
      });
    }

    return formation;
  }

  async saveOne(formation: Formation): Promise<Formation> {
    const savedFormation = await this.repository.save(formation);
    return this.repository.findOne({
      where: { id: savedFormation.id },
      relations: [FormationRelation.FORMATION_PLAYER_ENTITY],
    });
  }
}
