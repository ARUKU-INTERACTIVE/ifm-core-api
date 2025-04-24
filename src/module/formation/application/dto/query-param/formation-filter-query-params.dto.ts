import { PartialType } from '@nestjs/swagger';

import { FilterOptions } from '@common/base/application/interface/get-all-options.interface';

import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';

export class FormationFilterQueryParamsDto
  extends PartialType(FormationResponseDto)
  implements FilterOptions<FormationResponseDto> {}
