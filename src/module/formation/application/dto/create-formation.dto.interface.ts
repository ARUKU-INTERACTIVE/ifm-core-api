import { CreateFormationPlayerUuidDto } from '@module/formation-player/application/dto/create-formation-player.dto';

export interface ICreateFormationDto {
  name: string;
  description: string;
  forwards: number;
  midfielders: number;
  defenders: number;
  rosterUuid: string;
  formationPlayers: CreateFormationPlayerUuidDto[];
}
