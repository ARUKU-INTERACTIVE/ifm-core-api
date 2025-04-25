import { ICreateFormationPlayerDto } from '@module/formation-player/application/dto/create-formation-player.dto.interface';

export interface IUpdateFormationPlayerDto
  extends Partial<ICreateFormationPlayerDto> {
  playerFormationUuid?: string;
}
