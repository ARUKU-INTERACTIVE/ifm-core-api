import { Position } from '@module/formation/application/enum/formation-position.enum';

export interface ICreateFormationPlayerDto {
  position: Position;
  positionIndex: number;
}

export interface ICreateFormationPlayerUuidDto
  extends ICreateFormationPlayerDto {
  playerUuid: string;
  formationUuid?: string;
}

export interface ICreateFormationPlayerIdDto extends ICreateFormationPlayerDto {
  playerId: number;
  formationId?: number;
}
