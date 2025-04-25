import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { getDtoProperties } from '@common/base/application/dto/base.dto';
import { FieldsQueryParamsDto } from '@common/base/application/dto/query-param/fields-query-params.dto';
import { FieldOptions } from '@common/base/application/interface/get-all-options.interface';

import { RosterResponseDto } from '@/module/roster/application/dto/roster-response.dto';

export class RosterFieldsQueryParamsDto extends FieldsQueryParamsDto<RosterResponseDto> {
  @ApiPropertyOptional({
    description: 'List of attributes of ResponseDto',
    type: 'object',
  })
  @IsIn(getDtoProperties(RosterResponseDto), {
    each: true,
  })
  target = getDtoProperties(RosterResponseDto) as FieldOptions<
    Omit<RosterResponseDto, 'players'>
  >;
}
