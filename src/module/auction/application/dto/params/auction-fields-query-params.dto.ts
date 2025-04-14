import { Auction } from '@module/auction/domain/auction.domain';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

type AuctionFields = IGetAllOptions<Auction>['fields'];

export class AuctionFieldsQueryParamsDto {
  @ApiPropertyOptional()
  @IsIn(['externalId', 'playerId', 'status'] as AuctionFields, {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: AuctionFields;
}
