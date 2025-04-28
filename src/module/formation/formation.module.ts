import { FormationPlayerModule } from '@module/formation-player/formation-player.module';
import { FormationPostgresRepository } from '@module/formation/infrastructure/database/formation.postgres.repository';
import { PlayerModule } from '@module/player/player.module';
import { RosterModule } from '@module/roster/roster.module';
import { Module, Provider, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FormationResponseAdapter } from '@/module/formation/application/adapter/formation-response.adapter';
import { FormationMapper } from '@/module/formation/application/mapper/formation.mapper';
import { FORMATION_REPOSITORY_KEY } from '@/module/formation/application/repository/formation.repository.interface';
import { FormationService } from '@/module/formation/application/service/formation.service';
import { FormationSchema } from '@/module/formation/infrastructure/database/formation.schema';
import { FormationController as Controller } from '@/module/formation/interface/formation.controller';

const RepositoryProvider: Provider = {
  provide: FORMATION_REPOSITORY_KEY,
  useClass: FormationPostgresRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([FormationSchema]),
    RosterModule,
    forwardRef(() => PlayerModule),
    forwardRef(() => FormationPlayerModule),
  ],
  providers: [
    FormationService,
    FormationMapper,
    FormationResponseAdapter,
    RepositoryProvider,
  ],
  controllers: [Controller],
  exports: [FormationService, FormationMapper, RepositoryProvider],
})
export class FormationModule {}
