import { PlayerModule } from '@module/player/player.module';
import { RosterPostgresRepository } from '@module/roster/infrastructure/database/roster.postgres.repository';
import { Module, Provider, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RosterResponseAdapter } from '@/module/roster/application/adapter/roster-response.adapter';
import { RosterMapper } from '@/module/roster/application/mapper/roster.mapper';
import { ROSTER_REPOSITORY_KEY } from '@/module/roster/application/repository/roster.repository.interface';
import { RosterService } from '@/module/roster/application/service/roster.service';
import { RosterSchema } from '@/module/roster/infrastructure/database/roster.schema';
import { RosterController as Controller } from '@/module/roster/interface/roster.controller';

const RepositoryProvider: Provider = {
  provide: ROSTER_REPOSITORY_KEY,
  useClass: RosterPostgresRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([RosterSchema]),
    forwardRef(() => PlayerModule),
  ],
  providers: [
    RosterService,
    RosterMapper,
    RosterResponseAdapter,
    RepositoryProvider,
  ],
  controllers: [Controller],
  exports: [RosterService, RosterMapper, RepositoryProvider],
})
export class RosterModule {}
