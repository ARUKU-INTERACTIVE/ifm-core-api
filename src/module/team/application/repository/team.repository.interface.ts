import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { TeamRelation } from '@/module/team/application/enum/team-relation.enum';
import { Team } from '@/module/team/domain/team.entity';

export const TEAM_REPOSITORY_KEY = 'team_repository';

export interface ITeamRepository {
  getAll(
    options?: IGetAllOptions<Team, TeamRelation[]>,
  ): Promise<ICollection<Team>>;
  getOneByIdOrFail(id: number, relations?: TeamRelation[]): Promise<Team>;
  getOneByUserIdOrFail(
    userId: number,
    relations?: TeamRelation[],
  ): Promise<Team>;
  getOneByUserId(userId: number, relations?: TeamRelation[]): Promise<Team>;
  saveOne(team: Team): Promise<Team>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<Team, 'id'>>,
    relations?: string[],
  ): Promise<Team>;
  deleteOneOrFail(id: number): Promise<void>;
}
