import { PlayerService } from '@module/player/application/service/player.service';
import { RosterService } from '@module/roster/application/service/roster.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { StellarNftAdapter } from '@common/infrastructure/stellar/stellar-nft.adapter';

import { UserService } from '@iam/user/application/service/user.service';
import { User } from '@iam/user/domain/user.entity';
import { UserAlreadyHasTeamException } from '@iam/user/infrastructure/database/exception/user-already-has-team.exception';

import { TeamResponseAdapter } from '@/module/team/application/adapter/team-response.adapter';
import { ICreateTeamDto } from '@/module/team/application/dto/create-team.dto.interface';
import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';
import { IUpdateDto } from '@/module/team/application/dto/update-team.dto.interface';
import { TeamRelation } from '@/module/team/application/enum/team-relation.enum';
import { TeamMapper } from '@/module/team/application/mapper/team.mapper';
import {
  ITeamRepository,
  TEAM_REPOSITORY_KEY,
} from '@/module/team/application/repository/team.repository.interface';
import { Team } from '@/module/team/domain/team.entity';

@Injectable()
export class TeamService {
  constructor(
    @Inject(TEAM_REPOSITORY_KEY)
    private readonly teamRepository: ITeamRepository,
    private readonly teamMapper: TeamMapper,
    private readonly teamResponseAdapter: TeamResponseAdapter,
    private readonly stellarNFTAdapter: StellarNftAdapter,
    private readonly rosterService: RosterService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
  ) {}

  async getAll(
    options: IGetAllOptions<Team, TeamRelation[]>,
  ): Promise<ManySerializedResponseDto<TeamResponseDto>> {
    const { fields, include } = options || {};
    if (include && fields && !fields.includes('id')) fields.push('id');

    const collection = await this.teamRepository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((team: Team) =>
        this.teamMapper.fromTeamToTeamResponseDto(team),
      ),
    });

    return this.teamResponseAdapter.manyEntitiesResponse<TeamResponseDto>(
      collectionDto,
      include,
    );
  }

  async getOneByIdOrFail(
    id: number,
    relations?: TeamRelation[],
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    const team = await this.teamRepository.getOneByIdOrFail(id, relations);
    return this.teamResponseAdapter.oneEntityResponse<TeamResponseDto>(
      this.teamMapper.fromTeamToTeamResponseDto(team),
    );
  }

  async getOneByUserIdOrFail(
    userId: number,
    relations?: TeamRelation[],
  ): Promise<Team> {
    return await this.teamRepository.getOneByUserIdOrFail(userId, relations);
  }

  async getOneByUserId(
    userId: number,
    relations?: TeamRelation[],
  ): Promise<Team> {
    return await this.teamRepository.getOneByUserId(userId, relations);
  }

  async saveOne(
    createDto: ICreateTeamDto,
    currentUser: User,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    const ownedPlayerIds = [];
    const ownedNftIssuers = await this.stellarNFTAdapter.getUserOwnedNftIssuers(
      currentUser.publicKey,
    );

    if (currentUser.teamId) {
      throw new UserAlreadyHasTeamException();
    }

    for (const issuer of ownedNftIssuers || []) {
      const player = await this.playerService.getPlayerEntity({
        issuer,
      });

      if (player) {
        ownedPlayerIds.push(player.id);
      }
    }
    const team = await this.teamRepository.saveOne(
      this.teamMapper.fromCreateTeamDtoToTeam(
        createDto,
        ownedPlayerIds,
        currentUser.id,
      ),
    );

    this.userService.updateOne(currentUser.id, { teamId: team.id });

    const roster = await this.rosterService.saveOne({
      teamId: team.id,
      userId: currentUser.id,
    });

    team.roster = roster;

    return this.teamResponseAdapter.oneEntityResponse<TeamResponseDto>(
      this.teamMapper.fromTeamToTeamResponseDto(team),
    );
  }

  async updateOneOrFail(
    id: number,
    updateDto: IUpdateDto,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    const team = await this.teamRepository.updateOneOrFail(
      id,
      this.teamMapper.fromUpdateTeamDtoToTeam(updateDto),
    );
    return this.teamResponseAdapter.oneEntityResponse<TeamResponseDto>(
      this.teamMapper.fromTeamToTeamResponseDto(team),
    );
  }
}
