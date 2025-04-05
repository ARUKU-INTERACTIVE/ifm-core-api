import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import { Module } from '@nestjs/common';

import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';
import { StellarNftAdapter } from '@common/infrastructure/stellar/stellar-nft.adapter';
import { PinataAdapter } from '@common/infrastructure/ipfs/pinata.adapter';

@Module({
  imports: [],
  controllers: [],
  providers: [
    StellarAccountAdapter,
    SorobanContractAdapter,
    StellarTransactionAdapter,
    StellarNftAdapter,
    TransactionMapper,
    PinataAdapter,
    PlayerMapper,
  ],
  exports: [
    TransactionMapper,
    StellarAccountAdapter,
    StellarTransactionAdapter,
    StellarNftAdapter,
    SorobanContractAdapter,
  ],
})
export class StellarModule {}
