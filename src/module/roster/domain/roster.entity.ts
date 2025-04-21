import { Player } from '@module/player/domain/player.domain';
import { Team } from '@module/team/domain/team.entity';

import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

export class Roster extends Base {
  team: Team;
  teamId: number;
  user: User;
  userId: number;
  players: Player[];
}
