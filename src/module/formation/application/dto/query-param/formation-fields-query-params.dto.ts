import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { getDtoProperties } from '@common/base/application/dto/base.dto';
import { FieldsQueryParamsDto } from '@common/base/application/dto/query-param/fields-query-params.dto';
import { FieldOptions } from '@common/base/application/interface/get-all-options.interface';

import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';

export class FormationFieldsQueryParamsDto extends FieldsQueryParamsDto<FormationResponseDto> {
  @ApiPropertyOptional({
    description: 'List of attributes of ResponseDto',
    type: 'object',
  })
  @IsIn(getDtoProperties(FormationResponseDto), {
    each: true,
  })
  target = getDtoProperties(
    FormationResponseDto,
  ) as FieldOptions<FormationResponseDto>;
}
