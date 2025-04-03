import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { IPlayerRepository } from '@module/player/application/repository/player.repository.interface';
import { Player } from '@module/player/domain/player.domain';
import { PlayerSChema } from '@module/player/infrastructure/database/player.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class PlayerRepository implements IPlayerRepository {
  constructor(
    @InjectRepository(PlayerSChema)
    private readonly repository: Repository<Player>,
  ) {}

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
