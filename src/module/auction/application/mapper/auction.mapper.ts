import { AuctionResponseDto } from '@module/auction/application/dto/auction.response.dto';
import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { UpdateAuctionDto } from '@module/auction/application/dto/update-auction.dto';
import { Auction } from '@module/auction/domain/auction.domain';

export class AuctionMapper {
  fromAuctionToAuctionResponseDto(auction: Auction): AuctionResponseDto {
    const auctionResponseDto = new AuctionResponseDto();
    auctionResponseDto.id = auction.id;
    auctionResponseDto.uuid = auction.uuid;
    auctionResponseDto.externalId = auction.externalId;
    auctionResponseDto.status = auction.status;
    auctionResponseDto.player = auction.player;
    auctionResponseDto.createdAt = auction.createdAt;
    auctionResponseDto.updatedAt = auction.updatedAt;
    auctionResponseDto.deletedAt = auction.deletedAt;
    return auctionResponseDto;
  }

  private mapPlayerDtoToPlayer(
    auctionDto: CreateAuctionDto | UpdateAuctionDto,
  ): Auction {
    const auction = new Auction();
    auction.playerId = auctionDto.playerId;
    auction.externalId = auctionDto.externalId;
    return auction;
  }

  fromCreateAuctionDtoToAuction(createAuctionDto: CreateAuctionDto): Auction {
    const auction = this.mapPlayerDtoToPlayer(createAuctionDto);
    auction.playerId = createAuctionDto.playerId;
    return auction;
  }

  fromUpdatePlayerDtoToPlayer(updateAuctionDto: UpdateAuctionDto): Auction {
    return this.mapPlayerDtoToPlayer(updateAuctionDto);
  }
}
