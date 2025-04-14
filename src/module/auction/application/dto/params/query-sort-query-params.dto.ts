import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { SortType } from '@common/base/application/enum/sort-type.enum';

export class AuctionSortQueryParamsDto {
  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  externalId?: SortType;

  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  status?: SortType;

  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  playerId?: SortType;
}
