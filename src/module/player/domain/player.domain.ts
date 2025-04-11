import { Auction } from '@module/auction/domain/auction.domain';

import { Base } from '@common/base/domain/base.entity';

export class Player extends Base {
  name: string;
  description: string;
  issuer: string;
  imageCid: string;
  metadataCid: string;
  address: string;
  auctions: Auction[];
}
