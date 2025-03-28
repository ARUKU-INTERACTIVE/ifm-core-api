import { ICreatePlayerDto } from '@module/player/application/dto/create-player.dto.interface';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { IUpdatePlayerDto } from '@module/player/application/dto/update-player.dto.interface';
import { Player } from '@module/player/domain/player.domain';
import { Injectable } from '@nestjs/common';

import { ISCPlayerDto } from '@common/infrastructure/stellar/dto/player-sc.dto';

@Injectable()
export class PlayerMapper {
  private mapDtoToPlayer(
    playerDto: ICreatePlayerDto | IUpdatePlayerDto,
  ): Player {
    const player = new Player();
    player.name = playerDto.name;
    player.metadataUri = playerDto.metadataUri;
    player.issuer = playerDto.issuer;
    player.externalId = playerDto.externalId;
    return player;
  }

  fromCreatePlayerDtoToPlayer(playerDto: ICreatePlayerDto): Player {
    const player = this.mapDtoToPlayer(playerDto);
    player.ownerId = playerDto.ownerId;
    return player;
  }

  fromUpdatePlayerDtoToPlayer(PlayerDto: IUpdatePlayerDto): Player {
    return this.mapDtoToPlayer(PlayerDto);
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

  fromSCPlayerDtoToPlayer({
    name,
    token_id,
    issuer,
    metadata_uri,
  }: ISCPlayerDto): ICreatePlayerDto {
    return {
      name,
      externalId: Number(token_id),
      issuer,
      metadataUri: metadata_uri,
    };
  }
}
