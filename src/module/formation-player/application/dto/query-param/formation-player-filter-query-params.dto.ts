import { PartialType } from '@nestjs/swagger';

import { FilterOptions } from '@common/base/application/interface/get-all-options.interface';

import { ResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';

export class FormationPlayerFilterQueryParamsDto
  extends PartialType(ResponseDto)
  implements FilterOptions<ResponseDto> {}
