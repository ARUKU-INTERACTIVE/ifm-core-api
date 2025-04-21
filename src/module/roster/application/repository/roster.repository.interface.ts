import { ICollection } from '@common/base/application/dto/collection.interface';
import {
  FilterOptions,
  IGetAllOptions,
} from '@common/base/application/interface/get-all-options.interface';

import { RosterRelation } from '@/module/roster/application/enum/roster-relation.enum';
import { Roster } from '@/module/roster/domain/roster.entity';

export const ROSTER_REPOSITORY_KEY = 'roster_repository';

export interface IRosterPostgresRepository {
  getAll(
    options?: IGetAllOptions<Roster, RosterRelation[]>,
  ): Promise<ICollection<Roster>>;
  getOneByIdOrFail(id: number): Promise<Roster>;
  getOneById(id: number, relations?: RosterRelation[]): Promise<Roster>;
  getOneRosterOrFail(
    where: FilterOptions<Roster>,
    relations?: RosterRelation[],
  ): Promise<Roster>;
  saveOne(roster: Roster): Promise<Roster>;
}
