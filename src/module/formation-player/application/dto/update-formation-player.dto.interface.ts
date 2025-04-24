import { ICreateFormationPlayerIdDto } from '@module/formation-player/application/dto/create-formation-player.dto.interface';

export interface IUpdateFormationPlayerDto
  extends Partial<ICreateFormationPlayerIdDto> {}
