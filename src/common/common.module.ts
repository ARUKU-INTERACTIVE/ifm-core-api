import { Module } from '@nestjs/common';

import { TRANSACTION_REPOSITORY_KEY } from '@common/application/repository/transaction.repository';
import { StellarService } from '@common/infrastructure/stellar/stellar.service';

const transactionRepositoryProvider = {
  provide: TRANSACTION_REPOSITORY_KEY,
  useClass: StellarService,
};

@Module({
  providers: [transactionRepositoryProvider],
  exports: [transactionRepositoryProvider],
})
export class CommonModule {}
