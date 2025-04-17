import { PlayerModule } from '@module/player/player.module';
import { MySqlRepository } from '@module/team/infrastructure/database/team.postgres.repository';
import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeamResponseAdapter } from '@/module/team/application/adapter/team-response.adapter';
import { Mapper } from '@/module/team/application/mapper/team.mapper';
import { TEAM_REPOSITORY_KEY } from '@/module/team/application/repository/team.repository.interface';
import { Service } from '@/module/team/application/service/team.service';
import { TeamSchema } from '@/module/team/infrastructure/database/team.schema';
import { TeamController as Controller } from '@/module/team/interface/team.controller';

const RepositoryProvider: Provider = {
  provide: TEAM_REPOSITORY_KEY,
  useClass: MySqlRepository,
};

@Module({
  imports: [PlayerModule, TypeOrmModule.forFeature([TeamSchema])],
  providers: [Service, Mapper, TeamResponseAdapter, RepositoryProvider],
  controllers: [Controller],
  exports: [Service, Mapper, RepositoryProvider],
})
export class TeamModule {}
