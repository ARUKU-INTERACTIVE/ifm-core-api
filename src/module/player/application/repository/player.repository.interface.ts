import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { Player } from '@module/player/domain/player.domain';

export const PLAYER_REPOSITORY_KEY = 'player_repository';

export interface IPlayerRepository {
  getOneById(id: number, relations?: PlayerRelation[]): Promise<Player>;
  saveOne(book: Player, relations?: PlayerRelation[]): Promise<Player>;
}
