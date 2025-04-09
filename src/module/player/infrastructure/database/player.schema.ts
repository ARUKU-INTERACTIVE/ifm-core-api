import { Player } from '@module/player/domain/player.domain';
import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

export const PlayerSChema = new EntitySchema<Player>({
  name: 'Player',
  target: Player,
  tableName: 'player',
  columns: withBaseSchemaColumns({
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    metadataCid: {
      type: String,
      nullable: false,
      unique: true,
    },
    issuer: {
      type: String,
      nullable: false,
    },
    imageCid: {
      type: String,
      nullable: false,
      unique: true,
    },
    address: {
      type: String,
      nullable: false,
      unique: true,
    },
  }),
  relations: {
    owner: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'owner_id',
      },
    },
    auctions: {
      type: 'one-to-many',
      target: 'Auction',
    },
  },
});
