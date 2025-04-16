import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { TeamRelation } from '@/module/team/application/enum/team-relation.enum';

export class IncludeQueryParamsDto {
  @ApiPropertyOptional({
    enum: TeamRelation,
    isArray: true,
  })
  @IsIn(Object.values(TeamRelation), {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  fields?: TeamRelation[];
}
