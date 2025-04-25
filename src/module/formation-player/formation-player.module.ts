import { PlayerFormationPostgresRepository } from '@module/formation-player/infrastructure/database/formation-player.postgres.repository';
import { FormationModule } from '@module/formation/formation.module';
import { PlayerModule } from '@module/player/player.module';
import { Module, Provider, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResponseAdapter } from '@/module/formation-player/application/adapter/formation-player-response.adapter';
import { Mapper } from '@/module/formation-player/application/mapper/formation-player.mapper';
import { FORMATION_PLAYER_REPOSITORY_KEY } from '@/module/formation-player/application/repository/formation-player.repository.interface';
import { FormationPlayerService } from '@/module/formation-player/application/service/formation-player.service';
import { FormationPlayerSchema } from '@/module/formation-player/infrastructure/database/formation-player.schema';

const RepositoryProvider: Provider = {
  provide: FORMATION_PLAYER_REPOSITORY_KEY,
  useClass: PlayerFormationPostgresRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([FormationPlayerSchema]),
    forwardRef(() => PlayerModule),
    forwardRef(() => FormationModule),
  ],
  providers: [
    FormationPlayerService,
    Mapper,
    ResponseAdapter,
    RepositoryProvider,
  ],
  controllers: [],
  exports: [FormationPlayerService, Mapper, RepositoryProvider],
})
export class FormationPlayerModule {}
