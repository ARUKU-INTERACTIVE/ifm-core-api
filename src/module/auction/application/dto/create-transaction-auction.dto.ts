import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAuctionTransactionDto {
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
