import { PlayerService } from '@module/player/application/service/player.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { TeamRelation } from '@/module/team/application/enum/team-relation.enum';
import { ITeamRepository } from '@/module/team/application/repository/team.repository.interface';
import { Team } from '@/module/team/domain/team.entity';
import { TeamNotFoundException } from '@/module/team/infrastructure/database/exception/team-not-found.exception';
import { TeamSchema } from '@/module/team/infrastructure/database/team.schema';

export class TeamPostgresRepository implements ITeamRepository {
  constructor(
    @InjectRepository(TeamSchema)
    private readonly repository: Repository<Team>,
    private readonly playerService: PlayerService,
  ) {}

  async getAll(
    options?: IGetAllOptions<Team, Partial<TeamRelation[]>>,
  ): Promise<ICollection<Team>> {
    const { filter, page, sort, fields, include } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: filter,
      order: sort,
      select: fields,
      take: page.size,
      skip: page.offset,
      relations: include,
    });

    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

  async getOneByIdOrFail(
    id: number,
    relations: TeamRelation[] = [],
  ): Promise<Team> {
    const team = await this.repository.findOne({
      where: { id },
      relations,
    });

    if (!team) {
      throw new TeamNotFoundException({
        message: `Team with ID ${id} not found`,
      });
    }

    return team;
  }

  async getOneById(id: number, relations: TeamRelation[] = []): Promise<Team> {
    return this.repository.findOne({
      where: { id },
      relations,
    });
  }

  async getOneByUserIdOrFail(
    userId: number,
    relations: TeamRelation[] = [],
  ): Promise<Team> {
    const team = await this.repository.findOne({
      where: { userId },
      relations,
    });
    if (!team) {
      throw new TeamNotFoundException({
        message: `No team assigned to user with ID ${userId}`,
      });
    }

    return team;
  }

  async getOneByUserId(
    userId: number,
    relations: TeamRelation[] = [],
  ): Promise<Team> {
    return await this.repository.findOne({
      where: { userId },
      relations,
    });
  }

  async saveOne(team: Team, relations: TeamRelation[] = []): Promise<Team> {
    const savedTeam = await this.repository.save(team);
    return this.repository.findOne({ where: { id: savedTeam.id }, relations });
  }

  async updateOneOrFail(
    id: number,
    updates: Partial<Omit<Team, 'id'>>,
    relations: TeamRelation[] = [],
  ): Promise<Team> {
    const teamToUpdate = await this.repository.preload({
      ...updates,
      id,
    });

    if (!teamToUpdate) {
      throw new TeamNotFoundException({
        message: `Team with ID ${id} not found`,
      });
    }

    const savedTeam = await this.repository.save(teamToUpdate);

    return this.repository.findOne({ where: { id: savedTeam.id }, relations });
  }

  async deleteOneOrFail(id: number): Promise<void> {
    const teamToDelete = await this.repository.findOne({
      where: { id },
      relations: [TeamRelation.PLAYER_ENTITY],
    });

    if (!teamToDelete) {
      throw new TeamNotFoundException({
        message: `TeamModule with ID ${id} not found`,
      });
    }
    for (const player of teamToDelete.players) {
      player.team = null;
      player.teamId = null;
      player.roster = null;
      player.rosterId = null;
    }
    teamToDelete.userId = null;
    await this.repository.save(teamToDelete);
    await this.playerService.unsetPlayersFromTeam(teamToDelete.players);
    await this.repository.softRemove({ id });
  }
}
