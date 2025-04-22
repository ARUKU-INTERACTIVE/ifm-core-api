import { ICreateTeamDto } from '@/module/team/application/dto/create-team.dto.interface';

export interface IUpdateDto extends Partial<ICreateTeamDto> {
  name?: string;
  logo?: string;
}
