import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { getDtoProperties } from '@common/base/application/dto/base.dto';
import { FieldsQueryParamsDto } from '@common/base/application/dto/query-param/fields-query-params.dto';
import { FieldOptions } from '@common/base/application/interface/get-all-options.interface';

import { PlayerFormationResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';

export class FormationPlayerFieldsQueryParamsDto extends FieldsQueryParamsDto<PlayerFormationResponseDto> {
  @ApiPropertyOptional({
    description: 'List of attributes of ResponseDto',
    type: 'object',
  })
  @IsIn(getDtoProperties(PlayerFormationResponseDto), {
    each: true,
  })
  target = getDtoProperties(
    PlayerFormationResponseDto,
  ) as FieldOptions<PlayerFormationResponseDto>;
}
