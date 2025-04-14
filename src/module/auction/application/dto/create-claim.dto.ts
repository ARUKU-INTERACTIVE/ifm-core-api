import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateClaimDto {
  @IsNumber()
  @IsNotEmpty()
  auctionId: number;
}
