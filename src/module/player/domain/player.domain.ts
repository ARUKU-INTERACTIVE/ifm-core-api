import { Auction } from '@module/auction/domain/auction.domain';

import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

export class Player extends Base {
  name: string;
  description: string;
  owner: User;
  issuer: string;
  ownerId: number;
  imageCid: string;
  metadataCid: string;
  address: string;
  auctions: Auction[];
}
