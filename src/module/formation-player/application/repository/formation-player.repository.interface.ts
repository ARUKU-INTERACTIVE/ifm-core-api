import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { FormationPlayerRelation } from '@/module/formation-player/application/enum/formation-player-relation.enum';
import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';

export const FORMATION_PLAYER_REPOSITORY_KEY = 'formation-player_repository';

export interface IPlayerFormationRepository {
  getAll(
    options?: IGetAllOptions<FormationPlayer, FormationPlayerRelation[]>,
  ): Promise<ICollection<FormationPlayer>>;
  getOneByIdOrFail(id: number): Promise<FormationPlayer>;
  getOneById(
    id: number,
    relations?: FormationPlayerRelation[],
  ): Promise<FormationPlayer>;
  saveOne(formationPlayer: FormationPlayer): Promise<FormationPlayer>;
  saveMany(formationPlayers: FormationPlayer[]): Promise<FormationPlayer[]>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<FormationPlayer, 'id'>>,
    relations?: string[],
  ): Promise<FormationPlayer>;
  deleteOneOrFail(id: number): Promise<void>;
}
