import { ROSTER_ENTITY_NAME } from '@module/roster/domain/roster.name';

import { USER_ENTITY_NAME } from '@iam/user/domain/user.name';

export enum TeamRelation {
  PLAYER_ENTITY = 'players',
  USER_ENTITY = USER_ENTITY_NAME,
  ROSTER_ENTITY = ROSTER_ENTITY_NAME,
}
