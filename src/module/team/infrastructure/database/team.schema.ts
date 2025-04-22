import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Team } from '@/module/team/domain/team.entity';

export const TeamSchema = new EntitySchema<Team>({
  name: 'Team',
  target: Team,
  tableName: 'team',
  columns: withBaseSchemaColumns({
    name: {
      type: String,
    },
    logoUri: {
      type: String,
      nullable: false,
    },
    userId: {
      type: Number,
      nullable: true,
    },
  }),
  relations: {
    players: {
      type: 'one-to-many',
      target: 'Player',
      inverseSide: 'team',
    },
    user: {
      type: 'one-to-one',
      target: 'User',
      inverseSide: 'team',
      joinColumn: {
        name: 'user_id',
      },
    },
  },
});
