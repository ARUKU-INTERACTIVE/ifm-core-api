import { AuctionStatus } from '@module/auction/application/enum/auction-status.enum';
import { Player } from '@module/player/domain/player.domain';

import { Base } from '@common/base/domain/base.entity';

export class Auction extends Base {
  externalId: number;
  player: Player;
  status: AuctionStatus;
}
