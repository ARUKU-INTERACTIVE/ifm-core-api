import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { SortType } from '@common/base/application/enum/sort-type.enum';

export class PlayerSortQueryParamsDto {
  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  name?: SortType;

  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  metadataUri?: SortType;

  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  ownerId?: SortType;

  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  issuer?: SortType;

  @ApiPropertyOptional()
  @IsEnum(SortType)
  @IsOptional()
  externalId?: SortType;
}
