import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { User } from '@iam/user/domain/user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  tableName: 'user',
  columns: withBaseSchemaColumns({
    username: {
      type: String,
      unique: true,
      nullable: true,
    },
    externalId: {
      type: String,
      unique: true,
      nullable: true,
    },
    roles: {
      type: 'simple-array',
      nullable: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    publicKey: {
      type: String,
      unique: true,
    },
    teamId: {
      type: Number,
      unique: true,
      nullable: true,
    },
  }),
  relations: {
    team: {
      type: 'one-to-one',
      target: 'Team',
      inverseSide: 'team',
      joinColumn: {
        name: 'team_id',
      },
    },
  },
});
