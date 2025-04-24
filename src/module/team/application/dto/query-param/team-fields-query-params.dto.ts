import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { getDtoProperties } from '@common/base/application/dto/base.dto';
import { FieldsQueryParamsDto } from '@common/base/application/dto/query-param/fields-query-params.dto';
import { FieldOptions } from '@common/base/application/interface/get-all-options.interface';

import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';

export class TeamFieldsQueryParamsDto extends FieldsQueryParamsDto<TeamResponseDto> {
  @ApiPropertyOptional({
    description: 'List of attributes of ResponseDto',
    type: 'object',
  })
  @IsIn(getDtoProperties(TeamResponseDto), {
    each: true,
  })
  target = getDtoProperties(
    OmitType(TeamResponseDto, ['rosterId']),
  ) as FieldOptions<Omit<TeamResponseDto, 'rosterId'>>;
}
