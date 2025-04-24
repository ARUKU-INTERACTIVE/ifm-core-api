import { FormationPlayerService } from '@module/formation-player/application/service/formation-player.service';
import { PlayerService } from '@module/player/application/service/player.service';
import { RosterService } from '@module/roster/application/service/roster.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { ResponseAdapter } from '@/module/formation/application/adapter/formation-response.adapter';
import { ICreateFormationDto } from '@/module/formation/application/dto/create-formation.dto.interface';
import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';
import { FormationRelation } from '@/module/formation/application/enum/formation-relation.enum';
import { Mapper } from '@/module/formation/application/mapper/formation.mapper';
import {
  FORMATION_REPOSITORY_KEY,
  IFormationRepository,
} from '@/module/formation/application/repository/formation.repository.interface';
import { Formation } from '@/module/formation/domain/formation.entity';

@Injectable()
export class FormationService {
  constructor(
    @Inject(FORMATION_REPOSITORY_KEY)
    private readonly repository: IFormationRepository,
    private readonly mapper: Mapper,
    private readonly responseAdapter: ResponseAdapter,
    private readonly playerService: PlayerService,
    private readonly rosterService: RosterService,
    @Inject(forwardRef(() => FormationPlayerService))
    private readonly formationPlayerService: FormationPlayerService,
  ) {}

  async getAll(
    options: IGetAllOptions<Formation, FormationRelation[]>,
  ): Promise<ManySerializedResponseDto<FormationResponseDto>> {
    const { fields, include } = options || {};

    if (include && fields && !fields.includes('id')) fields.push('id');

    const collection = await this.repository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((formation: Formation) =>
        this.mapper.fromFormationToFormationResponseDto(formation),
      ),
    });

    return this.responseAdapter.manyEntitiesResponse<FormationResponseDto>(
      collectionDto,
      include,
    );
  }

  async getOneByIdOrFail(
    id: number,
  ): Promise<OneSerializedResponseDto<FormationResponseDto>> {
    const formation = await this.repository.getOneByIdOrFail(id);
    return this.responseAdapter.oneEntityResponse<FormationResponseDto>(
      this.mapper.fromFormationToFormationResponseDto(formation),
    );
  }

  async getOneByUuidOrFail(uuid: string): Promise<Formation> {
    return await this.repository.getOneByUuidOrFail(uuid);
  }

  async saveOne(
    createFormationDto: ICreateFormationDto,
  ): Promise<OneSerializedResponseDto<FormationResponseDto>> {
    const roster = await this.rosterService.getOneByUuidOrFail(
      createFormationDto.rosterUuid,
    );
    const formation = await this.repository.saveOne(
      this.mapper.fromCreateFormationDtoToFormation(
        createFormationDto,
        +roster.data.id,
      ),
    );
    const formationPlayerMapped = await Promise.all(
      createFormationDto.formationPlayers.map(async (formationPlayer) => {
        const player = await this.playerService.getOneByUuid(
          formationPlayer.playerUuid,
        );
        return {
          playerId: player.id,
          position: formationPlayer.position,
          formationId: formation.id,
        };
      }),
    );
    console.log(formationPlayerMapped, 'formationPlayerMapped');

    this.formationPlayerService.saveMany(formationPlayerMapped);
    return this.responseAdapter.oneEntityResponse<FormationResponseDto>(
      this.mapper.fromFormationToFormationResponseDto(formation),
    );
  }
}
