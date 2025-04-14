import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuctionDto {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  externalId: number;

  @IsNumber()
  @IsNotEmpty()
  playerId: number;

  @IsString()
  @IsNotEmpty()
  xdr: string;
}
