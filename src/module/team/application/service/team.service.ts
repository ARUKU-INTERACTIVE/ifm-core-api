import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneRelationResponse } from '@common/base/application/dto/one-relation-response.interface.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { ResponseAdapter } from '@/module/team/application/adapter/team-response.adapter';
import { ICreateDto } from '@/module/team/application/dto/create-team.dto.interface';
import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';
import { IUpdateDto } from '@/module/team/application/dto/update-team.dto.interface';
import { TeamRelation } from '@/module/team/application/enum/team-relation.enum';
import { Mapper } from '@/module/team/application/mapper/team.mapper';
import {
  IRepository,
  TEAM_REPOSITORY_KEY,
} from '@/module/team/application/repository/team.repository.interface';
import { Team } from '@/module/team/domain/team.entity';
import { TeamNotFoundException } from '@/module/team/infrastructure/database/exception/team-not-found.exception';

@Injectable()
export class Service {
  constructor(
    @Inject(TEAM_REPOSITORY_KEY)
    private readonly repository: IRepository,
    private readonly mapper: Mapper,
    private readonly responseAdapter: ResponseAdapter,
  ) {}

  async getAll(
    options: IGetAllOptions<Team, TeamRelation[]>,
  ): Promise<ManySerializedResponseDto<TeamResponseDto>> {
    const { fields, include } = options || {};

    if (include && fields && !fields.includes('id')) fields.push('id');

    const collection = await this.repository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((team: Team) =>
        this.mapper.fromTeamToTeamResponseDto(team),
      ),
    });

    return this.responseAdapter.manyEntitiesResponse<TeamResponseDto>(
      collectionDto,
      include,
    );
  }

  async getOneByIdOrFail(
    id: number,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    const team = await this.repository.getOneByIdOrFail(id);
    return this.responseAdapter.oneEntityResponse<TeamResponseDto>(
      this.mapper.fromTeamToTeamResponseDto(team),
    );
  }

  async saveOne(
    createDto: ICreateDto,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    const team = await this.repository.saveOne(
      this.mapper.fromCreateTeamDtoToTeam(createDto),
    );
    return this.responseAdapter.oneEntityResponse<TeamResponseDto>(
      this.mapper.fromTeamToTeamResponseDto(team),
    );
  }

  async updateOneOrFail(
    id: number,
    updateDto: IUpdateDto,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    const team = await this.repository.updateOneOrFail(
      id,
      this.mapper.fromUpdateTeamDtoToTeam(updateDto),
    );
    return this.responseAdapter.oneEntityResponse<TeamResponseDto>(
      this.mapper.fromTeamToTeamResponseDto(team),
    );
  }

  async getOneRelation(
    id: number,
    relationName: TeamRelation,
  ): Promise<OneRelationResponse> {
    const teamRelationsList = Object.values(TeamRelation);

    if (!teamRelationsList.includes(relationName)) {
      throw new BadRequestException(
        `Invalid relation name: ${relationName}, expected one of ${teamRelationsList}`,
      );
    }

    const team = await this.repository.getOneById(id, [relationName]);

    if (!team) {
      throw new TeamNotFoundException({
        message: `Team with ID ${id} not found`,
      });
    }

    const relationData = team[relationName] ?? null;

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
