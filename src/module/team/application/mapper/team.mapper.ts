import { Player } from '@module/player/domain/player.domain';
import { Injectable } from '@nestjs/common';

import { ICreateDto } from '@/module/team/application/dto/create-team.dto.interface';
import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';
import { IUpdateDto } from '@/module/team/application/dto/update-team.dto.interface';
import { Team } from '@/module/team/domain/team.entity';

@Injectable()
export class Mapper {
  fromCreateTeamDtoToTeam(teamDto: ICreateDto, userId: number): Team {
    const team = new Team();
    team.name = teamDto.name;
    team.logoUri = teamDto.logoUri;
    team.players = (teamDto?.players?.map((id) => ({ id })) || []) as Player[];
    team.userId = userId;
    return team;
  }

  fromUpdateTeamDtoToTeam(teamDto: IUpdateDto): Team {
    const team = new Team();
    team.name = teamDto.name;
    team.logoUri = teamDto.logoUri;
    return team;
  }

  fromTeamToTeamResponseDto(team: Team): TeamResponseDto {
    const teamResponseDto = new TeamResponseDto();
    teamResponseDto.id = team.id;
    teamResponseDto.uuid = team.uuid;
    teamResponseDto.name = team.name;
    teamResponseDto.logoUri = team.logoUri;
    teamResponseDto.createdAt = team.createdAt;
    teamResponseDto.updatedAt = team.updatedAt;
    teamResponseDto.deletedAt = team.deletedAt;
    return teamResponseDto;
  }
}
