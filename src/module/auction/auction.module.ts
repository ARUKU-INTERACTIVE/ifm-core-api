import { AuctionSchema } from '@module/auction/infrastructure/database/auction.schema';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionSchema])],
  controllers: [],
  providers: [],
})
export class AuctionModule {}
