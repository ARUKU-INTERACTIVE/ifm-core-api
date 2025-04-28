import { ICreateFormationPlayerUuidDto } from '@module/formation-player/application/dto/create-formation-player.dto.interface';
import { IUpdateFormationPlayerDto } from '@module/formation-player/application/dto/update-formation-player.dto.interface';
import { ICreateFormationDto } from '@module/formation/application/dto/create-formation.dto.interface';

export interface IUpdateFormationDto
  extends Partial<
    Omit<ICreateFormationDto, 'rosterUuid' | 'formationPlayers'>
  > {
  formationUuid: string;
  formationPlayers: IUpdateFormationPlayerDto[];
  newFormationPlayers?: ICreateFormationPlayerUuidDto[];
}
