import { FormationService } from '@module/formation/application/service/formation.service';
import { PlayerService } from '@module/player/application/service/player.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneRelationResponse } from '@common/base/application/dto/one-relation-response.interface.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { ResponseAdapter } from '@/module/formation-player/application/adapter/formation-player-response.adapter';
import {
  ICreateFormationPlayerIdDto,
  ICreateFormationPlayerUuidDto,
} from '@/module/formation-player/application/dto/create-formation-player.dto.interface';
import { ResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';
import { IUpdateFormationPlayerDto } from '@/module/formation-player/application/dto/update-formation-player.dto.interface';
import { FormationPlayerRelation } from '@/module/formation-player/application/enum/formation-player-relation.enum';
import { Mapper } from '@/module/formation-player/application/mapper/formation-player.mapper';
import {
  FORMATION_PLAYER_REPOSITORY_KEY,
  IPlayerFormationRepository,
} from '@/module/formation-player/application/repository/formation-player.repository.interface';
import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';
import { FormationPlayerNotFoundException } from '@/module/formation-player/infrastructure/database/exception/formation-player-not-found.exception';

@Injectable()
export class FormationPlayerService {
  constructor(
    @Inject(FORMATION_PLAYER_REPOSITORY_KEY)
    private readonly repository: IPlayerFormationRepository,
    private readonly mapper: Mapper,
    private readonly responseAdapter: ResponseAdapter,
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => FormationService))
    private readonly formationService: FormationService,
  ) {}

  async getAll(
    options: IGetAllOptions<FormationPlayer, FormationPlayerRelation[]>,
  ): Promise<ManySerializedResponseDto<ResponseDto>> {
    const { fields, include } = options || {};

    if (include && fields && !fields.includes('id')) fields.push('id');

    const collection = await this.repository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((formationPlayer: FormationPlayer) =>
        this.mapper.fromFormationPlayerToFormationPlayerResponseDto(
          formationPlayer,
        ),
      ),
    });

    return this.responseAdapter.manyEntitiesResponse<ResponseDto>(
      collectionDto,
      include,
    );
  }

  async getOneByIdOrFail(
    id: number,
  ): Promise<OneSerializedResponseDto<ResponseDto>> {
    const formationPlayer = await this.repository.getOneByIdOrFail(id);
    return this.responseAdapter.oneEntityResponse<ResponseDto>(
      this.mapper.fromFormationPlayerToFormationPlayerResponseDto(
        formationPlayer,
      ),
    );
  }

  async saveOne(
    createFormationPlayerDto: ICreateFormationPlayerUuidDto,
  ): Promise<OneSerializedResponseDto<ResponseDto>> {
    const player = await this.playerService.getOneByUuid(
      createFormationPlayerDto.playerUuid,
    );

    const formation = await this.formationService.getOneByUuidOrFail(
      createFormationPlayerDto.formationUuid,
    );
    const formationPlayer = await this.repository.saveOne(
      this.mapper.fromCreateFormationPlayerDtoToFormationPlayer({
        playerId: player.id,
        formationId: formation.id,
        position: createFormationPlayerDto.position,
      }),
    );
    return this.responseAdapter.oneEntityResponse<ResponseDto>(
      this.mapper.fromFormationPlayerToFormationPlayerResponseDto(
        formationPlayer,
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
  async updateOneOrFail(
    id: number,
    updateFormationPlayerDto: IUpdateFormationPlayerDto,
  ): Promise<OneSerializedResponseDto<ResponseDto>> {
    const formationPlayer = await this.repository.updateOneOrFail(
      id,
      this.mapper.fromUpdateFormationPlayerDtoToFormationPlayer(
        updateFormationPlayerDto,
      ),
    );
    return this.responseAdapter.oneEntityResponse<ResponseDto>(
      this.mapper.fromFormationPlayerToFormationPlayerResponseDto(
        formationPlayer,
      ),
    );
  }

  async getOneRelation(
    id: number,
    relationName: FormationPlayerRelation,
  ): Promise<OneRelationResponse> {
    const formationPlayerRelationsList = Object.values(FormationPlayerRelation);

    if (!formationPlayerRelationsList.includes(relationName)) {
      throw new BadRequestException(
        `Invalid relation name: ${relationName}, expected one of ${formationPlayerRelationsList}`,
      );
    }

    const formationPlayer = await this.repository.getOneById(id, [
      relationName,
    ]);

    if (!formationPlayer) {
      throw new FormationPlayerNotFoundException({
        message: `FormationPlayer with ID ${id} not found`,
      });
    }

    const relationData = formationPlayer[relationName] ?? null;

    return this.responseAdapter.oneRelationshipsResponse(
      relationData,
      relationName,
      relationData?.id.toString(),
    );
  }
  async deleteOneOrFail(id: number): Promise<void> {
    return this.repository.deleteOneOrFail(id);
  }
}
