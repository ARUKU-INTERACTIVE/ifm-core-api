import { Injectable } from '@nestjs/common';
import { Contract } from '@stellar/stellar-sdk';

import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

@Injectable()
export class SorobanContractAdapter {
  private readonly contractAddress: string;

  constructor(
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
  ) {}

  async getContract(): Promise<Contract> {
    return new Contract(this.contractAddress);
  }

  async submitMintPlayer(xdr: string) {
    const { txHash } =
      await this.stellarTransactionAdapter.submitSorobanTransaction(xdr);
    return txHash;
  }
}
