import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { FormationPlayerRelation } from '@/module/formation-player/application/enum/formation-player-relation.enum';

export class IncludeQueryParamsDto {
  @ApiPropertyOptional({
    enum: FormationPlayerRelation,
    isArray: true,
  })
  @IsIn(Object.values(FormationPlayerRelation), {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  fields?: FormationPlayerRelation[];
}
