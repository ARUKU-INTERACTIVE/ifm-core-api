import { AddPlayerToRosterDto } from '@module/player/application/dto/add-player-roster.dto';
import { PlayerService } from '@module/player/application/service/player.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import {
  FilterOptions,
  IGetAllOptions,
} from '@common/base/application/interface/get-all-options.interface';

import { User } from '@iam/user/domain/user.entity';

import { RosterResponseAdapter } from '@/module/roster/application/adapter/roster-response.adapter';
import { ICreateRosterDto } from '@/module/roster/application/dto/create-roster.dto.interface';
import { RosterResponseDto } from '@/module/roster/application/dto/roster-response.dto';
import { RosterRelation } from '@/module/roster/application/enum/roster-relation.enum';
import { RosterMapper } from '@/module/roster/application/mapper/roster.mapper';
import {
  IRosterPostgresRepository,
  ROSTER_REPOSITORY_KEY,
} from '@/module/roster/application/repository/roster.repository.interface';
import { Roster } from '@/module/roster/domain/roster.entity';

@Injectable()
export class RosterService {
  public readonly MAX_PLAYERS = 11;
  constructor(
    @Inject(ROSTER_REPOSITORY_KEY)
    private readonly repository: IRosterPostgresRepository,
    private readonly rosterMapper: RosterMapper,
    private readonly responseAdapter: RosterResponseAdapter,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
  ) {}

  async getAll(
    options: IGetAllOptions<Roster, RosterRelation[]>,
  ): Promise<ManySerializedResponseDto<RosterResponseDto>> {
    const { fields, include } = options || {};

    if (include && fields && !fields.includes('id')) {
      fields.push('id');
    }

    const collection = await this.repository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((roster: Roster) =>
        this.rosterMapper.fromRosterToRosterResponseDto(roster),
      ),
    });

    return this.responseAdapter.manyEntitiesResponse<RosterResponseDto>(
      collectionDto,
      include,
    );
  }

  async getOneByUuidOrFail(
    uuid: string,
    relations?: RosterRelation[],
  ): Promise<OneSerializedResponseDto<RosterResponseDto>> {
    const roster = await this.repository.getOneByUuidOrFail(uuid, relations);
    return this.responseAdapter.oneEntityResponse<RosterResponseDto>(
      this.rosterMapper.fromRosterToRosterResponseDto(roster),
    );
  }

  async getOneByUuid(
    uuid: string,
    relations?: RosterRelation[],
  ): Promise<Roster> {
    return await this.repository.getOneByUuid(uuid, relations);
  }

  async saveOne(createRosterDto: ICreateRosterDto): Promise<Roster> {
    return await this.repository.saveOne(
      this.rosterMapper.fromCreateRosterDtoToRoster(createRosterDto),
    );
  }

  async getOneRosterOrFail(
    where: FilterOptions<Roster>,
    relations?: RosterRelation[],
  ): Promise<Roster> {
    return await this.repository.getOneRosterOrFail(where, relations);
  }
  async addPlayerToRoster(
    user: User,
    updatePlayerRosterDto: AddPlayerToRosterDto,
  ) {
    return await this.playerService.addPlayerToRoster(
      user,
      updatePlayerRosterDto,
    );
  }

  async removePlayerFromRoster(
    user: User,
    updatePlayerRosterDto: AddPlayerToRosterDto,
  ) {
    return await this.playerService.removePlayerFromRoster(
      user,
      updatePlayerRosterDto,
    );
  }
}
