import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransactionAuctionDto {
  @IsNumber()
  @IsNotEmpty()
  playerId: number;

  @IsNumber()
  @IsNotEmpty()
  startingPrice: number;

  @IsNumber()
  @IsNotEmpty()
  auctionTimeMs: number;
}
