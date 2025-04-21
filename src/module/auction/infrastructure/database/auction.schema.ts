import { Auction } from '@module/auction/domain/auction.domain';
import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

export const AuctionSchema = new EntitySchema<Auction>({
  name: 'Auction',
  target: Auction,
  tableName: 'auction',
  columns: withBaseSchemaColumns({
    externalId: {
      type: Number,
      nullable: false,
    },
    playerId: {
      type: Number,
      nullable: false,
    },
  }),
  relations: {
    player: {
      type: 'many-to-one',
      target: 'Player',
      joinColumn: {
        name: 'player_id',
      },
      inverseSide: 'auctions',
    },
  },
});
