import { Position } from '@module/formation/application/enum/formation-position.enum';
import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { ENVIRONMENT } from '@config/environment.enum';

import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';

const isEnvironmentTesting =
  process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS;

export const FormationPlayerSchema = new EntitySchema<FormationPlayer>({
  name: 'FormationPlayer',
  target: FormationPlayer,
  tableName: 'formation_player',
  columns: withBaseSchemaColumns({
    formationId: {
      type: Number,
      nullable: false,
    },
    playerId: {
      type: Number,
      nullable: false,
    },
    position: isEnvironmentTesting
      ? {
          type: String,
          nullable: false,
        }
      : {
          type: 'enum',
          enum: Position,
          nullable: false,
        },
  }),
  relations: {
    player: {
      target: 'Player',
      type: 'many-to-one',
      onDelete: 'SET NULL',
      inverseSide: 'formationPlayers',
      joinColumn: {
        name: 'player_id',
      },
    },
    formation: {
      target: 'Formation',
      type: 'many-to-one',
      onDelete: 'CASCADE',
      inverseSide: 'formationPlayers',
      joinColumn: {
        name: 'formation_id',
      },
      cascade: true,
    },
  },
});
