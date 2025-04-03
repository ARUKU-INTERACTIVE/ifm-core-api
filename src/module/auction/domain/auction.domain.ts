import { AuctionStatus } from '@module/auction/application/enum/auction-status.enum';
import { Player } from '@module/player/domain/player.domain';

export class Auction {
  externalId: number;
  player: Player;
  status: AuctionStatus;
}
