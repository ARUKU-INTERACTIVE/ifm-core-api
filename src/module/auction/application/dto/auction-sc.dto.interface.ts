import { AuctionSCStatus } from '@module/auction/application/enum/auction-status.enum';

export interface ISCAuctionDto {
  id: bigint;
  highest_bidder_address?: string;
  owner_address: string;
  highest_bid_amount: bigint;
  end_time: bigint;
  start_time: bigint;
  player_address: string;
  status: AuctionSCStatus[];
}
