import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerDto } from '@module/player/application/dto/player.dto';
import { IPlayerDto } from '@module/player/application/dto/player.dto.interface';
import { IUpdatePlayerDto } from '@module/player/application/dto/update-player.dto.interface';
import { Player } from '@module/player/domain/player.domain';
import { Injectable } from '@nestjs/common';

import { ISCPlayerDto } from '@common/infrastructure/stellar/dto/player-sc.dto';

@Injectable()
export class PlayerMapper {
  private mapPlayerDtoToPlayer(
    playerDto: IPlayerDto | IUpdatePlayerDto,
  ): Player {
    const player = new Player();
    player.name = playerDto.name;
    player.metadataUri = playerDto.metadataUri;
    player.issuer = playerDto.issuer;
    player.externalId = playerDto.externalId;
    return player;
  }

  fromCreatePlayerDtoToPlayer(playerDto: IPlayerDto): Player {
    const player = this.mapPlayerDtoToPlayer(playerDto);
    player.ownerId = playerDto.ownerId;
    return player;
  }

  fromUpdatePlayerDtoToPlayer(PlayerDto: IUpdatePlayerDto): Player {
    return this.mapPlayerDtoToPlayer(PlayerDto);
  }

  fromPlayerToPlayerResponseDto(player: Player): PlayerResponseDto {
    const playerResponseDto = new PlayerResponseDto();
    playerResponseDto.id = player.id?.toString();
    playerResponseDto.uuid = player.uuid;
    playerResponseDto.name = player.name;
    playerResponseDto.issuer = player.issuer;
    playerResponseDto.externalId = player.externalId;
    playerResponseDto.metadataUri = player.metadataUri;
    playerResponseDto.createdAt = player.createdAt;
    playerResponseDto.updatedAt = player.updatedAt;
    playerResponseDto.deletedAt = player.deletedAt;
    playerResponseDto.owner = player?.owner;
    return playerResponseDto;
  }

  fromSCPlayerDtoToPlayer(scPlayerDto: ISCPlayerDto): PlayerDto {
    const playerDto = new PlayerDto();
    playerDto.name = scPlayerDto.name;
    playerDto.externalId = Number(scPlayerDto.id);
    playerDto.issuer = scPlayerDto.issuer;
    playerDto.metadataUri = scPlayerDto.metadata_uri;
    return playerDto;
  }
}
