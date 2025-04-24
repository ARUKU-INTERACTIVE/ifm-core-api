import { ICreateFormationPlayerIdDto } from '@module/formation-player/application/dto/create-formation-player.dto.interface';
import { Injectable } from '@nestjs/common';

import { ResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';
import { IUpdateFormationPlayerDto } from '@/module/formation-player/application/dto/update-formation-player.dto.interface';
import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';

@Injectable()
export class Mapper {
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
    formationPlayerDto: ICreateFormationPlayerIdDto[],
  ): FormationPlayer[] {
    return formationPlayerDto.map(({ playerId, position, formationId }) => {
      const formationPlayer = new FormationPlayer();
      formationPlayer.position = position;
      formationPlayer.formationId = formationId;
      formationPlayer.playerId = playerId;
      return formationPlayer;
    });
  }

  fromUpdateFormationPlayerDtoToFormationPlayer(
    formationPlayerDto: IUpdateFormationPlayerDto,
  ): FormationPlayer {
    const formationPlayer = new FormationPlayer();
    formationPlayer.position = formationPlayerDto.position;
    formationPlayer.formationId = formationPlayerDto.formationId;
    formationPlayer.playerId = formationPlayerDto.playerId;
    return formationPlayer;
  }

  fromFormationPlayerToFormationPlayerResponseDto(
    formationPlayer: FormationPlayer,
  ): ResponseDto {
    const formationPlayerResponseDto = new ResponseDto();
    formationPlayerResponseDto.id = formationPlayer.id;
    formationPlayerResponseDto.uuid = formationPlayer.uuid;
    formationPlayerResponseDto.createdAt = formationPlayer.createdAt;
    formationPlayerResponseDto.updatedAt = formationPlayer.updatedAt;
    formationPlayerResponseDto.deletedAt = formationPlayer.deletedAt;
    return formationPlayerResponseDto;
  }
}
