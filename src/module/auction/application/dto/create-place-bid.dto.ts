import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePlaceBIdDto {
  @IsNumber()
  @IsNotEmpty()
  bidAmount: number;

  @IsNumber()
  @IsNotEmpty()
  auctionId: number;
}
