import { ICreateFormationPlayerIdDto } from '@module/formation-player/application/dto/create-formation-player.dto.interface';
import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import { Injectable } from '@nestjs/common';

import { FormationPlayerResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';
import { IUpdateFormationPlayerDto } from '@/module/formation-player/application/dto/update-formation-player.dto.interface';
import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';

@Injectable()
export class FormationPlayerMapper {
  constructor(private readonly playerMapper: PlayerMapper) {}
  fromCreateFormationPlayerDtoToFormationPlayer(
    formationPlayerDto: ICreateFormationPlayerIdDto,
  ): FormationPlayer {
    const formationPlayer = new FormationPlayer();
    formationPlayer.position = formationPlayerDto.position;
    formationPlayer.formationId = formationPlayerDto.formationId;
    formationPlayer.playerId = formationPlayerDto.playerId;
    return formationPlayer;
  }

  fromCreateFormationPlayerDtoToFormationPlayers(
    formationPlayersDto: ICreateFormationPlayerIdDto[],
  ): FormationPlayer[] {
    return formationPlayersDto.map((formationPlayerDto) => {
      const formationPlayer = new FormationPlayer();
      formationPlayer.position = formationPlayerDto.position;
      formationPlayer.positionIndex = formationPlayerDto.positionIndex;
      formationPlayer.formationId = formationPlayerDto.formationId;
      formationPlayer.playerId = formationPlayerDto.playerId;
      return formationPlayer;
    });
  }

  fromUpdateFormationPlayerDtoToFormationPlayer(
    formationPlayerDto: IUpdateFormationPlayerDto,
  ): FormationPlayer {
    const formationPlayer = new FormationPlayer();
    formationPlayer.position = formationPlayerDto.position;
    formationPlayer.formationId = formationPlayerDto.positionIndex;
    return formationPlayer;
  }

  fromFormationPlayerToFormationPlayerResponseDto(
    formationPlayer: FormationPlayer,
  ): FormationPlayerResponseDto {
    const formationPlayerResponseDto = new FormationPlayerResponseDto();
    formationPlayerResponseDto.id = formationPlayer.id;
    formationPlayerResponseDto.uuid = formationPlayer.uuid;
    if (formationPlayer.player) {
      formationPlayerResponseDto.player =
        this.playerMapper.fromPlayerToPlayerResponseDto(formationPlayer.player);
    }
    formationPlayerResponseDto.createdAt = formationPlayer.createdAt;
    formationPlayerResponseDto.updatedAt = formationPlayer.updatedAt;
    formationPlayerResponseDto.deletedAt = formationPlayer.deletedAt;
    return formationPlayerResponseDto;
  }
}
