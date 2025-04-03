import { PlayerResponseAdapter } from '@module/player/application/adapter/player-response.adapter';
import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import { PLAYER_REPOSITORY_KEY } from '@module/player/application/repository/player.repository.interface';
import { PlayerService } from '@module/player/application/service/player.service';
import { PlayerRepository } from '@module/player/infrastructure/database/player.mysql.repository';
import { PlayerSChema } from '@module/player/infrastructure/database/player.schema';
import { PlayerController } from '@module/player/interface/player.controller';
import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StellarModule } from '@common/infrastructure/stellar/stellar.module';

import { UserModule } from '@iam/user/user.module';

const playerRepositoryProvider: Provider = {
  provide: PLAYER_REPOSITORY_KEY,
  useClass: PlayerRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerSChema]),
    StellarModule,
    UserModule,
  ],
  providers: [
    playerRepositoryProvider,
    PlayerService,
    PlayerResponseAdapter,
    PlayerMapper,
  ],
  controllers: [PlayerController],
  exports: [
    PlayerService,
    PlayerResponseAdapter,
    PlayerMapper,
    playerRepositoryProvider,
  ],
})
export class PlayerModule {}
