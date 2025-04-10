import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateAuctionDto extends PartialType(CreateAuctionDto) {}
