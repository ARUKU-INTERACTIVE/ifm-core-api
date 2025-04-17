import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { Player } from '@module/player/domain/player.domain';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

export const PLAYER_REPOSITORY_KEY = 'player_repository';

export interface IPlayerRepository {
  getAll(
    options: IGetAllOptions<Player, PlayerRelation[]>,
  ): Promise<ICollection<Player>>;
  getOneById(id: number, relations?: PlayerRelation[]): Promise<Player>;
  saveOne(player: Player, relations?: PlayerRelation[]): Promise<Player>;
  unsetPlayersFromTeam(player: Player[]): Promise<Player[]>;
}
