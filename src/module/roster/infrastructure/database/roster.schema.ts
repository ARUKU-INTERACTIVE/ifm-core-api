import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Roster } from '@/module/roster/domain/roster.entity';

export const RosterSchema = new EntitySchema<Roster>({
  name: 'Roster',
  target: Roster,
  tableName: 'roster',
  columns: withBaseSchemaColumns({
    teamId: {
      type: Number,
    },
  }),
  relations: {
    team: {
      type: 'one-to-one',
      target: 'Team',
      inverseSide: 'roster',
      joinColumn: {
        name: 'team_id',
      },
    },
    players: {
      type: 'one-to-many',
      target: 'Player',
      inverseSide: 'roster',
    },
  },
});
