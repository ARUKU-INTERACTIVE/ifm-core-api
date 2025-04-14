import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

export class AuctionIncludeQueryParamsDto {
  @ApiPropertyOptional({
    enum: AuctionRelation,
    isArray: true,
  })
  @IsIn(Object.values(AuctionRelation), {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: AuctionRelation[];
}
