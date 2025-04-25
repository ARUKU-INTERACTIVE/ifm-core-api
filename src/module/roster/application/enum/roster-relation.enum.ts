import { TEAM_ENTITY_NAME } from '@module/team/domain/team.name';

import { USER_ENTITY_NAME } from '@iam/user/domain/user.name';

export enum RosterRelation {
  User = USER_ENTITY_NAME,
  Team = TEAM_ENTITY_NAME,
  Player = 'players',
}
