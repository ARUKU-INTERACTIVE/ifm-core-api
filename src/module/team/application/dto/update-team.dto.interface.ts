import { ICreateTeamDto } from '@/module/team/application/dto/create-team.dto.interface';

export interface IUpdateTeamDto extends Partial<ICreateTeamDto> {
  name?: string;
  logo?: string;
}
