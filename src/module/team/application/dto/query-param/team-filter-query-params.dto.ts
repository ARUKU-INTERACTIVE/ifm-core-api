import { PartialType } from '@nestjs/swagger';

import { FilterOptions } from '@common/base/application/interface/get-all-options.interface';

import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';

export class TeamFilterQueryParamsDto
  extends PartialType(TeamResponseDto)
  implements FilterOptions<TeamResponseDto> {}
