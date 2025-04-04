import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

export class PlayerIncludeQueryParamsDto {
  @ApiPropertyOptional({
    enum: PlayerRelation,
    isArray: true,
  })
  @IsIn(Object.values(PlayerRelation), {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: PlayerRelation[];
}
