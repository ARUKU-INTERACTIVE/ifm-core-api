import { AuctionResponseAdapter } from '@module/auction/application/adapter/auction-response.adapter';
import { AuctionMapper } from '@module/auction/application/mapper/auction.mapper';
import { AUCTION_REPOSITORY_KEY } from '@module/auction/application/repository/auction.repository.interface';
import { AuctionService } from '@module/auction/application/service/auction.service';
import { AuctionRepository } from '@module/auction/infrastructure/database/auction.postgres.repository';
import { AuctionSchema } from '@module/auction/infrastructure/database/auction.schema';
import { AuctionController } from '@module/auction/interface/auction.controller';
import { PlayerModule } from '@module/player/player.module';
import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StellarModule } from '@common/infrastructure/stellar/stellar.module';

const auctionRepositoryProvider: Provider = {
  provide: AUCTION_REPOSITORY_KEY,
  useClass: AuctionRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([AuctionSchema]),
    PlayerModule,
    StellarModule,
  ],
  controllers: [AuctionController],
  providers: [
    AuctionService,
    AuctionResponseAdapter,
    AuctionMapper,
    auctionRepositoryProvider,
  ],
})
export class AuctionModule {}
