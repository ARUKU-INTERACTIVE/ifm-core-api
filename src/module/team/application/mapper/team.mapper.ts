import { Injectable } from '@nestjs/common';

import { ICreateDto } from '@/module/team/application/dto/create-team.dto.interface';
import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';
import { IUpdateDto } from '@/module/team/application/dto/update-team.dto.interface';
import { Team } from '@/module/team/domain/team.entity';

@Injectable()
export class Mapper {
  private mapDtoToTeam(teamDto: IUpdateDto): Team {
    const team = new Team();
    team.name = teamDto.name;
    return team;
  }

  fromCreateTeamDtoToTeam(teamDto: ICreateDto): Team {
    return this.mapDtoToTeam(teamDto);
  }

  fromUpdateTeamDtoToTeam(teamDto: IUpdateDto): Team {
    return this.mapDtoToTeam(teamDto);
  }

  fromTeamToTeamResponseDto(team: Team): TeamResponseDto {
    const teamResponseDto = new TeamResponseDto();
    teamResponseDto.id = team.id;
    teamResponseDto.uuid = team.uuid;
    teamResponseDto.name = team.name;
    teamResponseDto.createdAt = team.createdAt;
    teamResponseDto.updatedAt = team.updatedAt;
    teamResponseDto.deletedAt = team.deletedAt;
    return teamResponseDto;
  }
}
