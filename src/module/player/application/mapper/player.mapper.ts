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

  private mapPlayerDtoToPlayer(playerDto: PlayerDto): Player {
    const player = new Player();
    player.name = playerDto.name;
    player.metadataCid = playerDto.metadataCid;
    player.imageCid = playerDto.imageCid;
    player.description = playerDto.description;
    player.issuer = playerDto.issuer;
    player.address = playerDto.address;
    return player;
  }

  fromCreatePlayerDtoToPlayer(playerDto: PlayerDto): Player {
    const player = this.mapPlayerDtoToPlayer(playerDto);
    player.ownerId = playerDto.ownerId;
    return player;
  }

  fromUpdatePlayerDtoToPlayer(playerDto: PlayerDto): Player {
    return this.mapPlayerDtoToPlayer(playerDto);
  }

  fromPlayerToPlayerResponseDto(player: Player): PlayerResponseDto {
    const playerResponseDto = new PlayerResponseDto();
    playerResponseDto.id = player.id?.toString();
    playerResponseDto.uuid = player.uuid;
    playerResponseDto.name = player.name;
    playerResponseDto.description = player.description;
    playerResponseDto.issuer = player.issuer;
    playerResponseDto.metadataUri = this.getPinataUri(player.metadataCid);
    playerResponseDto.imageUri = this.getPinataUri(player.imageCid);
    playerResponseDto.createdAt = player.createdAt;
    playerResponseDto.updatedAt = player.updatedAt;
    playerResponseDto.deletedAt = player.deletedAt;
    playerResponseDto.owner = player?.owner;
    playerResponseDto.auctions = player?.auctions;
    playerResponseDto.address = player?.address;
    return playerResponseDto;
  }

  fromSubmitMintPlayerDtoToPlayer(
    submitMintPlayerDto: SubmitMintPlayerDto,
    ownerId: number,
  ): PlayerDto {
    const playerDto = new Player();
    playerDto.name = submitMintPlayerDto.name;
    playerDto.issuer = submitMintPlayerDto.issuer;
    playerDto.ownerId = ownerId;
    playerDto.metadataCid = submitMintPlayerDto.metadataCid;
    playerDto.imageCid = submitMintPlayerDto.imageCid;
    playerDto.description = submitMintPlayerDto.description;
    return playerDto;
  }
}
