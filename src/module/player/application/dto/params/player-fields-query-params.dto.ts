import { Player } from '@module/player/domain/player.domain';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

type PlayerFields = IGetAllOptions<Player>['fields'];

export class PlayerFieldsQueryParamsDto {
  @ApiPropertyOptional()
  @IsIn(
    ['name', 'metadataCid', 'ownerId', 'issuer', 'description'] as PlayerFields,
    {
      each: true,
    },
  )
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: PlayerFields;
}
