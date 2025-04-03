import { AuctionStatus } from '@module/auction/application/enum/auction-status.enum';
import { Auction } from '@module/auction/domain/auction.domain';
import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { ENVIRONMENT } from '@config/environment.enum';

const isEnvironmentAutomatedTest =
  process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS;

export const AuctionSchema = new EntitySchema<Auction>({
  name: 'Auction',
  target: Auction,
  tableName: 'auction',
  columns: withBaseSchemaColumns({
    externalId: {
      type: Number,
      nullable: false,
    },
    status: isEnvironmentAutomatedTest
      ? { type: String, default: AuctionStatus.Open }
      : {
          type: 'enum',
          enum: AuctionStatus,
          default: AuctionStatus.Open,
        },
  }),
});
