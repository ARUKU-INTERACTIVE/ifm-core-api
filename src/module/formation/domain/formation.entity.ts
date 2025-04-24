import { FormationPlayer } from '@module/formation-player/domain/formation-player.entity';
import { Roster } from '@module/roster/domain/roster.entity';

import { Base } from '@common/base/domain/base.entity';

export class Formation extends Base {
  name: string;
  description: string;
  forwards: number;
  midfielders: number;
  defenders: number;
  roster: Roster;
  rosterId: number;
  formationPlayers: FormationPlayer[];
}
