import { PartialType } from '@nestjs/swagger';

import { FilterOptions } from '@common/base/application/interface/get-all-options.interface';

import { RosterResponseDto } from '@/module/roster/application/dto/roster-response.dto';

export class RosterFilterQueryParamsDto
  extends PartialType(RosterResponseDto)
  implements FilterOptions<RosterResponseDto> {}
