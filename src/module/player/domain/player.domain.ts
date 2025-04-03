import { Auction } from '@module/auction/domain/auction.domain';

import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

export class Player extends Base {
  name: string;
  metadataUri: string;
  owner: User;
  ownerId: number;
  issuer: string;
  externalId: number;
  auctions: Auction[];
}
