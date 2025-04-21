import { PlayerResponseUpdateDto } from '@module/player/application/dto/player-response-update-dto';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerDto } from '@module/player/application/dto/player.dto';
import { SubmitMintPlayerDto } from '@module/player/application/dto/submit-mint-player.dto';
import { Player } from '@module/player/domain/player.domain';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PlayerMapper {
  pinataGatewayUrl: string;
  constructor(private readonly environmentConfig: ConfigService) {
    this.pinataGatewayUrl = this.environmentConfig.get(
      'pinata.pinataGatewayUrl',
    );
  }

  private getPinataUri(cid: string): string {
    return `https://${this.pinataGatewayUrl}/ipfs/${cid}`;
  }

  fromCreatePlayerDtoToPlayer(playerDto: PlayerDto, teamId?: number): Player {
    const player = new Player();
    player.name = playerDto.name;
    player.metadataCid = playerDto.metadataCid;
    player.imageCid = playerDto.imageCid;
    player.description = playerDto.description;
    player.issuer = playerDto.issuer;
    player.address = playerDto.address;
    if (teamId) {
      player.teamId = teamId;
    }
    return player;
  }

  fromPlayerToPlayerResponseDto(player: Player): PlayerResponseDto {
    const playerResponseDto = new PlayerResponseDto();
    playerResponseDto.id = player.id?.toString();
    playerResponseDto.uuid = player.uuid;
    playerResponseDto.name = player.name;
    playerResponseDto.description = player.description;
    playerResponseDto.issuer = player.issuer;
    playerResponseDto.teamId = player.teamId;
    playerResponseDto.rosterId = player.rosterId;
    playerResponseDto.metadataUri = this.getPinataUri(player.metadataCid);
    playerResponseDto.imageUri = this.getPinataUri(player.imageCid);
    playerResponseDto.createdAt = player.createdAt;
    playerResponseDto.updatedAt = player.updatedAt;
    playerResponseDto.deletedAt = player.deletedAt;
    playerResponseDto.auctions = player?.auctions;
    playerResponseDto.address = player?.address;
    return playerResponseDto;
  }

  fromSubmitMintPlayerDtoToPlayer(
    submitMintPlayerDto: SubmitMintPlayerDto,
  ): Player {
    const player = new Player();
    player.name = submitMintPlayerDto.name;
    player.issuer = submitMintPlayerDto.issuer;
    player.metadataCid = submitMintPlayerDto.metadataCid;
    player.imageCid = submitMintPlayerDto.imageCid;
    player.description = submitMintPlayerDto.description;
    return player;
  }

  fromCountPlayerToPlayerResponseUpdateDto(
    updatedCount: number,
    deletedCount: number,
  ) {
    const playerResponseUpdateDto = new PlayerResponseUpdateDto();
    playerResponseUpdateDto.updatedCount = updatedCount;
    playerResponseUpdateDto.deletedCount = deletedCount;
    return playerResponseUpdateDto;
  }
}
