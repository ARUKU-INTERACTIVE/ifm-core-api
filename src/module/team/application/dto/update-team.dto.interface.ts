import { ICreateDto } from '@/module/team/application/dto/create-team.dto.interface';

export interface IUpdateDto extends Partial<ICreateDto> {
  name?: string;
}
