import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { RosterRelation } from '@/module/roster/application/enum/roster-relation.enum';

export class IncludeQueryParamsDto {
  @ApiPropertyOptional({
    enum: RosterRelation,
    isArray: true,
  })
  @IsIn(Object.values(RosterRelation), {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  fields?: RosterRelation[];
}
