import { FormationPlayerService } from '@module/formation-player/application/service/formation-player.service';
import { FormationFilterQueryParamsDto } from '@module/formation/application/dto/query-param/formation-filter-query-params.dto';
import { IUpdateFormationDto } from '@module/formation/application/dto/update-formation.dto.interface';
import { PlayerService } from '@module/player/application/service/player.service';
import { RosterService } from '@module/roster/application/service/roster.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import {
  FieldOptions,
  SortOptions,
} from '@common/base/application/interface/get-all-options.interface';

import { ResponseAdapter } from '@/module/formation/application/adapter/formation-response.adapter';
import { ICreateFormationDto } from '@/module/formation/application/dto/create-formation.dto.interface';
import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';
import { FormationRelation } from '@/module/formation/application/enum/formation-relation.enum';
import { FormationMapper } from '@/module/formation/application/mapper/formation.mapper';
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
    private readonly formationMapper: FormationMapper,
    private readonly responseAdapter: ResponseAdapter,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    private readonly rosterService: RosterService,
    @Inject(forwardRef(() => FormationPlayerService))
    private readonly formationPlayerService: FormationPlayerService,
  ) {}

  async getAll(options: {
    page: PageQueryParamsDto;
    filter: FormationFilterQueryParamsDto;
    fields: FieldOptions<FormationResponseDto>;
    sort: SortOptions<FormationResponseDto>;
    include: FormationRelation[];
  }): Promise<ManySerializedResponseDto<FormationResponseDto>> {
    const { fields, include } = options || {};
    const roster = await this.rosterService.getOneByUuid(
      options.filter.rosterUuid,
    );

    if (roster) {
      options.filter.rosterId = roster.id;
    }

    options.filter.rosterUuid = undefined;

    if (include && fields && !fields.includes('id')) fields.push('id');

    const collection = await this.repository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((formation: Formation) =>
        this.formationMapper.fromFormationToFormationResponseDto(formation),
      ),
    });

    return this.responseAdapter.manyEntitiesResponse<FormationResponseDto>(
      collectionDto,
      include,
    );
  }

  async getOneByUuidOrFail(uuid: string): Promise<Formation> {
    return await this.repository.getOneByUuidOrFail(uuid);
  }

  async getOneMappedByUuidOrFail(
    uuid: string,
    relations: FormationRelation[],
  ): Promise<OneSerializedResponseDto<FormationResponseDto>> {
    const formation = await this.repository.getOneByUuidOrFail(uuid, relations);
    return this.responseAdapter.oneEntityResponse<FormationResponseDto>(
      this.formationMapper.fromFormationToFormationResponseDto(formation),
    );
  }

  async saveOne(
    createFormationDto: ICreateFormationDto,
  ): Promise<OneSerializedResponseDto<FormationResponseDto>> {
    const roster = await this.rosterService.getOneByUuidOrFail(
      createFormationDto.rosterUuid,
    );
    const formation = await this.repository.saveOne(
      this.formationMapper.fromCreateFormationDtoToFormation(
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
          positionIndex: formationPlayer.positionIndex,
        };
      }),
    );

    this.formationPlayerService.saveMany(formationPlayerMapped);
    return this.responseAdapter.oneEntityResponse<FormationResponseDto>(
      this.formationMapper.fromFormationToFormationResponseDto(formation),
    );
  }

  async updateOne(
    updateFormationDto: IUpdateFormationDto,
  ): Promise<OneSerializedResponseDto<FormationResponseDto>> {
    const formation = await this.repository.getOneByUuidOrFail(
      updateFormationDto.formationUuid,
    );
    await Promise.all(
      updateFormationDto.formationPlayers.map(async (formationPlayer) => {
        const formationPlayerEntity =
          await this.formationPlayerService.getOneByUuidOrFail(
            formationPlayer.playerFormationUuid,
          );
        const formationPlayerMapped = {
          ...formationPlayerEntity,
          position: formationPlayer.position,
          formationId: formation.id,
          positionIndex: formationPlayer.positionIndex,
        };
        await this.formationPlayerService.saveOneFormationPlayer(
          formationPlayerMapped,
        );
      }),
    );
    if (updateFormationDto?.newFormationPlayers) {
      const formationPlayerMapped = await Promise.all(
        updateFormationDto.newFormationPlayers.map(async (formationPlayer) => {
          const player = await this.playerService.getOneByUuid(
            formationPlayer.playerUuid,
          );
          return {
            playerId: player.id,
            position: formationPlayer.position,
            formationId: formation.id,
            positionIndex: formationPlayer.positionIndex,
          };
        }),
      );
      this.formationPlayerService.saveMany(formationPlayerMapped);
    }
    return this.responseAdapter.oneEntityResponse<FormationResponseDto>(
      this.formationMapper.fromFormationToFormationResponseDto(formation),
    );
  }
}
