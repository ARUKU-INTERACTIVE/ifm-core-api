import { FormationService } from '@module/formation/application/service/formation.service';
import { PlayerService } from '@module/player/application/service/player.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

import { ResponseAdapter } from '@/module/formation-player/application/adapter/formation-player-response.adapter';
import { ICreateFormationPlayerIdDto } from '@/module/formation-player/application/dto/create-formation-player.dto.interface';
import { FormationPlayerResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';
import { FormationPlayerMapper } from '@/module/formation-player/application/mapper/formation-player.mapper';
import {
  FORMATION_PLAYER_REPOSITORY_KEY,
  IFormationPlayerRepository,
} from '@/module/formation-player/application/repository/formation-player.repository.interface';
import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';

@Injectable()
export class FormationPlayerService {
  constructor(
    @Inject(FORMATION_PLAYER_REPOSITORY_KEY)
    private readonly repository: IFormationPlayerRepository,
    private readonly mapper: FormationPlayerMapper,
    private readonly responseAdapter: ResponseAdapter,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => FormationService))
    private readonly formationService: FormationService,
  ) {}

  async getOneByUuidOrFail(
    formationPlayerUuid: string,
  ): Promise<FormationPlayer> {
    return await this.repository.getOneByUuidOrFail(formationPlayerUuid);
  }

  async saveOneFormationPlayer(
    formationPlayer: FormationPlayer,
  ): Promise<OneSerializedResponseDto<FormationPlayerResponseDto>> {
    const savedFormationPlayer = await this.repository.saveOne(formationPlayer);
    return this.responseAdapter.oneEntityResponse<FormationPlayerResponseDto>(
      this.mapper.fromFormationPlayerToFormationPlayerResponseDto(
        savedFormationPlayer,
      ),
    );
  }

  async saveMany(
    createFormationPlayerDto: ICreateFormationPlayerIdDto[],
  ): Promise<FormationPlayer[]> {
    return await this.repository.saveMany(
      this.mapper.fromCreateFormationPlayerDtoToFormationPlayers(
        createFormationPlayerDto,
      ),
    );
  }

  async updateMany(
    formationPlayer: FormationPlayer[],
  ): Promise<FormationPlayer[]> {
    return await this.repository.saveMany(formationPlayer);
  }

  async deleteManyByPlayerIdOrFail(playerId: number) {
    return this.repository.deleteManyByPlayerIdOrFail(playerId);
  }
}
