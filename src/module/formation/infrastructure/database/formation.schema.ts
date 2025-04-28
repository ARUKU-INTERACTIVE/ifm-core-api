import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Formation } from '@/module/formation/domain/formation.entity';

export const FormationSchema = new EntitySchema<Formation>({
  name: 'Formation',
  target: Formation,
  tableName: 'formation',
  columns: withBaseSchemaColumns({
    name: {
      type: String,
      nullable: false,
    },
    defenders: { type: Number, nullable: false },
    description: { type: String, nullable: true, default: '' },
    forwards: { type: Number, nullable: false },
    midfielders: { type: Number, nullable: false },
    isActive: { type: Boolean, nullable: false, default: false },
    rosterId: { type: Number, nullable: false },
  }),
  relations: {
    roster: {
      type: 'many-to-one',
      target: 'Roster',
      inverseSide: 'formation',
      joinColumn: {
        name: 'roster_id',
      },
    },
    formationPlayers: {
      type: 'one-to-many',
      target: 'FormationPlayer',
      inverseSide: 'formation',
    },
  },
});
