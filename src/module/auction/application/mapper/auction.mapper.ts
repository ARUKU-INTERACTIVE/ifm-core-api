import { ISCAuctionDto } from '@module/auction/application/dto/auction-sc.dto.interface';
import { AuctionResponseDto } from '@module/auction/application/dto/auction.response.dto';
import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { UpdateAuctionDto } from '@module/auction/application/dto/update-auction.dto';
import { Auction } from '@module/auction/domain/auction.domain';

export class AuctionMapper {
  fromAuctionToAuctionResponseDto(
    auction: Auction,
    auctionSC: ISCAuctionDto,
  ): AuctionResponseDto {
    const auctionResponseDto = new AuctionResponseDto();
    auctionResponseDto.id = auction.id;
    auctionResponseDto.uuid = auction.uuid;
    auctionResponseDto.externalId = auction.externalId;
    auctionResponseDto.player = auction.player;
    auctionResponseDto.status = auctionSC.status?.[0];
    auctionResponseDto.highestBidAmount = Number(auctionSC.highest_bid_amount);
    auctionResponseDto.highestBidderAddress = auctionSC.highest_bidder_address;
    auctionResponseDto.playerAddress = auctionSC.player_address;
    auctionResponseDto.startTime = Number(auctionSC.start_time);
    auctionResponseDto.endTime = Number(auctionSC.end_time);
    auctionResponseDto.createdAt = auction.createdAt;
    auctionResponseDto.updatedAt = auction.updatedAt;
    auctionResponseDto.deletedAt = auction.deletedAt;
    return auctionResponseDto;
  }

  private mapPlayerDtoToPlayer(
    auctionDto: CreateAuctionDto | UpdateAuctionDto,
  ): Auction {
    const auction = new Auction();
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
