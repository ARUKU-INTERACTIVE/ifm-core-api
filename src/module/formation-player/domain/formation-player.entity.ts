import { Position } from '@module/formation/application/enum/formation-position.enum';
import { Formation } from '@module/formation/domain/formation.entity';
import { Player } from '@module/player/domain/player.domain';

import { Base } from '@common/base/domain/base.entity';

export class FormationPlayer extends Base {
  player: Player;
  playerId: number;
  formation?: Formation;
  formationId?: number;
  positionIndex: number;
  position: Position;
}
