import { Auction } from '@module/auction/domain/auction.domain';
import { Roster } from '@module/roster/domain/roster.entity';
import { Team } from '@module/team/domain/team.entity';

import { Base } from '@common/base/domain/base.entity';

export class Player extends Base {
  name: string;
  description: string;
  issuer: string;
  imageCid: string;
  metadataCid: string;
  address: string;
  auctions: Auction[];
  team?: Team;
  teamId?: number;
  roster?: Roster;
  rosterId?: number;
}
