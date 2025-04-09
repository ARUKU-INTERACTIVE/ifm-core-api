import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import { PlayerModule } from '@module/player/player.module';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PinataModule } from '@common/infrastructure/ipfs/pinata.module';
import { TransactionResponseAdapter } from '@common/infrastructure/stellar/application/adapter/transaction-response.adapter';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';
import { StellarNftAdapter } from '@common/infrastructure/stellar/stellar-nft.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

@Module({
  imports: [PinataModule, forwardRef(() => PlayerModule)],
  controllers: [],
  providers: [
    StellarAccountAdapter,
    SorobanContractAdapter,
    StellarTransactionAdapter,
    StellarNftAdapter,
    TransactionMapper,
    PlayerMapper,
    TransactionResponseAdapter,
    ConfigService,
  ],
  exports: [
    TransactionMapper,
    StellarAccountAdapter,
    StellarTransactionAdapter,
    StellarNftAdapter,
    SorobanContractAdapter,
    TransactionResponseAdapter,
  ],
})
export class StellarModule {}
