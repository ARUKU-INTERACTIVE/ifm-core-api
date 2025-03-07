import { Module } from '@nestjs/common';

import { StellarService } from '@/stellar/application/service/stellar.service';

@Module({
  providers: [StellarService],
  exports: [StellarService],
})
export class StellarModule {}
