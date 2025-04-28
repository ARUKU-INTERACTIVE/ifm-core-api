import { Inject, Injectable } from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

import { FormationPlayerResponseAdapter } from '@/module/formation-player/application/adapter/formation-player-response.adapter';
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
    private readonly formationPlayerRepository: IFormationPlayerRepository,
    private readonly formationPlayerMapper: FormationPlayerMapper,
    private readonly responseAdapter: FormationPlayerResponseAdapter,
  ) {}

  async getOneByUuidOrFail(
    formationPlayerUuid: string,
  ): Promise<FormationPlayer> {
    return await this.formationPlayerRepository.getOneByUuidOrFail(
      formationPlayerUuid,
    );
  }

  async saveOneFormationPlayer(
    formationPlayer: FormationPlayer,
  ): Promise<OneSerializedResponseDto<FormationPlayerResponseDto>> {
    const savedFormationPlayer =
      await this.formationPlayerRepository.saveOne(formationPlayer);
    return this.responseAdapter.oneEntityResponse<FormationPlayerResponseDto>(
      this.formationPlayerMapper.fromFormationPlayerToFormationPlayerResponseDto(
        savedFormationPlayer,
      ),
    );
  }

  async saveMany(
    createFormationPlayerDto: ICreateFormationPlayerIdDto[],
  ): Promise<FormationPlayer[]> {
    return await this.formationPlayerRepository.saveMany(
      this.formationPlayerMapper.fromCreateFormationPlayerDtoToFormationPlayers(
        createFormationPlayerDto,
      ),
    );
  }

  async updateMany(
    formationPlayer: FormationPlayer[],
  ): Promise<FormationPlayer[]> {
    return await this.formationPlayerRepository.saveMany(formationPlayer);
  }

  async deleteManyByPlayerIdOrFail(playerId: number) {
    return this.formationPlayerRepository.deleteManyByPlayerIdOrFail(playerId);
  }
}
