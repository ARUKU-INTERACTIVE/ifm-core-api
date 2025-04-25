import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';

export const FORMATION_PLAYER_REPOSITORY_KEY = 'formation-player_repository';

export interface IFormationPlayerRepository {
  getOneByUuidOrFail(formationPlayerUuid: string): Promise<FormationPlayer>;
  saveMany(formationPlayers: FormationPlayer[]): Promise<FormationPlayer[]>;
  deleteManyByPlayerIdOrFail(playerId: number): Promise<void>;
  saveOne(formationPlayer: FormationPlayer): Promise<FormationPlayer>;
}
