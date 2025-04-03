import { AUCTION_ENTITY_NAME } from '@module/auction/domain/auction.name';

import { USER_ENTITY_NAME } from '@iam/user/domain/user.name';

export enum PlayerRelation {
  AUCTION = AUCTION_ENTITY_NAME,
  USER = USER_ENTITY_NAME,
}
