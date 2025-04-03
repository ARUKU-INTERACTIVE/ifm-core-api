import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import { Module } from '@nestjs/common';

import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

@Module({
  imports: [],
  controllers: [],
  providers: [
    StellarAccountAdapter,
    SorobanContractAdapter,
    StellarTransactionAdapter,
    TransactionMapper,
    PlayerMapper,
  ],
  exports: [
    TransactionMapper,
    StellarAccountAdapter,
    StellarTransactionAdapter,
    SorobanContractAdapter,
  ],
})
export class StellarModule {}
