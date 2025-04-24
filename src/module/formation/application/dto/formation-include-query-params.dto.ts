import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { FormationRelation } from '@/module/formation/application/enum/formation-relation.enum';

export class IncludeQueryParamsDto {
  @ApiPropertyOptional({
    enum: FormationRelation,
    isArray: true,
  })
  @IsIn(Object.values(FormationRelation), {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  fields?: FormationRelation[];
}
