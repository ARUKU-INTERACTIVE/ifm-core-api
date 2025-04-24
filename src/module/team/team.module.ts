import { PlayerModule } from '@module/player/player.module';
import { RosterModule } from '@module/roster/roster.module';
import { TeamPostgresRepository } from '@module/team/infrastructure/database/team.postgres.repository';
import { Module, Provider, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StellarModule } from '@common/infrastructure/stellar/stellar.module';

import { UserModule } from '@iam/user/user.module';

import { TeamResponseAdapter } from '@/module/team/application/adapter/team-response.adapter';
import { TeamMapper } from '@/module/team/application/mapper/team.mapper';
import { TEAM_REPOSITORY_KEY } from '@/module/team/application/repository/team.repository.interface';
import { TeamService } from '@/module/team/application/service/team.service';
import { TeamSchema } from '@/module/team/infrastructure/database/team.schema';
import { TeamController } from '@/module/team/interface/team.controller';

const RepositoryProvider: Provider = {
  provide: TEAM_REPOSITORY_KEY,
  useClass: TeamPostgresRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamSchema]),
    forwardRef(() => PlayerModule),
    StellarModule,
    RosterModule,
    UserModule,
  ],
  providers: [TeamService, TeamMapper, TeamResponseAdapter, RepositoryProvider],
  controllers: [TeamController],
  exports: [TeamService, TeamMapper, RepositoryProvider],
})
export class TeamModule {}
