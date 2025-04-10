import { AuctionStatus } from '@module/auction/application/enum/auction-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class AuctionFilterQueryParamsDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  externalId?: number;

  @ApiPropertyOptional()
  @IsEnum(AuctionStatus)
  @IsOptional()
  status?: AuctionStatus;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  number?: number;
}
