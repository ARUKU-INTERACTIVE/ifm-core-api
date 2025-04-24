import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import { Injectable } from '@nestjs/common';

import { ICreateRosterDto } from '@/module/roster/application/dto/create-roster.dto.interface';
import { RosterResponseDto } from '@/module/roster/application/dto/roster-response.dto';
import { Roster } from '@/module/roster/domain/roster.entity';

@Injectable()
export class RosterMapper {
  constructor(private readonly playerMapper: PlayerMapper) {}
  fromCreateRosterDtoToRoster(rosterDto: ICreateRosterDto): Roster {
    const roster = new Roster();
    roster.teamId = rosterDto.teamId;
    return roster;
  }

  fromRosterToRosterResponseDto(roster: Roster): RosterResponseDto {
    const rosterResponseDto = new RosterResponseDto();
    rosterResponseDto.id = roster.id;
    rosterResponseDto.uuid = roster.uuid;
    rosterResponseDto.teamId = roster.teamId;
    if (roster.players) {
      rosterResponseDto.players = roster.players?.map((player) =>
        this.playerMapper.fromPlayerToPlayerResponseDto(player),
      );
    }
    rosterResponseDto.createdAt = roster.createdAt;
    rosterResponseDto.updatedAt = roster.updatedAt;
    rosterResponseDto.deletedAt = roster.deletedAt;
    return rosterResponseDto;
  }
}
