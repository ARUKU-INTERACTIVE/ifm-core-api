import { Player } from '@module/player/domain/player.domain';
import { Roster } from '@module/roster/domain/roster.entity';

import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

export class Team extends Base {
  name: string;
  logoUri: string;
  players: Player[];
  user: User;
  userId: number;
  roster: Roster;
}
