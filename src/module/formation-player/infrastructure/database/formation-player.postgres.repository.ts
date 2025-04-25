import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FormationPlayerRelation } from '@/module/formation-player/application/enum/formation-player-relation.enum';
import { IFormationPlayerRepository } from '@/module/formation-player/application/repository/formation-player.repository.interface';
import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';
import { FormationPlayerNotFoundException } from '@/module/formation-player/infrastructure/database/exception/formation-player-not-found.exception';
import { FormationPlayerSchema } from '@/module/formation-player/infrastructure/database/formation-player.schema';

export class FormationPlayerPostgresRepository
  implements IFormationPlayerRepository
{
  constructor(
    @InjectRepository(FormationPlayerSchema)
    private readonly repository: Repository<FormationPlayer>,
  ) {}

  async getOneByUuidOrFail(
    uuid: string,
    relations: FormationPlayerRelation[] = [],
  ): Promise<FormationPlayer> {
    const formationPlayer = await this.repository.findOne({
      where: { uuid },
      relations,
    });

    if (!formationPlayer) {
      throw new FormationPlayerNotFoundException({
        message: `FormationPlayer with UUID ${uuid} not found`,
      });
    }

    return formationPlayer;
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

  async deleteManyByPlayerIdOrFail(playerId: number): Promise<void> {
    const formationPlayersToDelete = await this.repository.find({
      where: { player: { id: playerId } },
    });
    if (!formationPlayersToDelete.length) {
      throw new FormationPlayerNotFoundException({
        message: `FormationPlayer with player ID ${playerId} not found`,
      });
    }

    await this.repository.softDelete({ playerId });
  }
}
