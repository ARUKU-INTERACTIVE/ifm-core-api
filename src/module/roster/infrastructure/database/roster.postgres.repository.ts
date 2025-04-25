import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import {
  FilterOptions,
  IGetAllOptions,
} from '@common/base/application/interface/get-all-options.interface';

import { RosterRelation } from '@/module/roster/application/enum/roster-relation.enum';
import { IRosterPostgresRepository } from '@/module/roster/application/repository/roster.repository.interface';
import { Roster } from '@/module/roster/domain/roster.entity';
import { RosterNotFoundException } from '@/module/roster/infrastructure/database/exception/roster-not-found.exception';
import { RosterSchema } from '@/module/roster/infrastructure/database/roster.schema';

export class RosterPostgresRepository implements IRosterPostgresRepository {
  constructor(
    @InjectRepository(RosterSchema)
    private readonly repository: Repository<Roster>,
  ) {}

  async getAll(
    options?: IGetAllOptions<Roster, Partial<RosterRelation[]>>,
  ): Promise<ICollection<Roster>> {
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

  async getOneByUuidOrFail(
    uuid: string,
    relations: RosterRelation[] = [],
  ): Promise<Roster> {
    const rooster = await this.repository.findOne({
      where: { uuid },
      relations,
    });

    if (!rooster) {
      throw new RosterNotFoundException({
        message: `Roster with ID ${uuid} not found`,
      });
    }

    return rooster;
  }

  async getOneByUuid(
    uuid: string,
    relations: RosterRelation[] = [],
  ): Promise<Roster> {
    return await this.repository.findOne({
      where: { uuid },
      relations,
    });
  }

  async getOneRosterOrFail(
    where: FilterOptions<Roster>,
    relations?: RosterRelation[],
  ): Promise<Roster> {
    const roster = await this.repository.findOne({
      where,
      relations,
    });

    if (!roster) {
      throw new RosterNotFoundException({
        message: 'Roster not found',
      });
    }

    return roster;
  }

  async getOneById(
    id: number,
    relations: RosterRelation[] = [],
  ): Promise<Roster> {
    return this.repository.findOne({
      where: { id },
      relations,
    });
  }

  async saveOne(
    roster: Roster,
    relations: RosterRelation[] = [],
  ): Promise<Roster> {
    const savedRoster = await this.repository.save(roster);
    return this.repository.findOne({
      where: { id: savedRoster.id },
      relations,
    });
  }
}
