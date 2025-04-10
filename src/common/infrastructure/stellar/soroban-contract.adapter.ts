import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, Contract, xdr } from '@stellar/stellar-sdk';

import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

@Injectable()
export class SorobanContractAdapter {
  private readonly contractAddress: string;

  constructor(
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly environmentConfig: ConfigService,
  ) {
    this.contractAddress = this.environmentConfig.get(
      'soroban.contractAddress',
    );
  }

  async getContract(): Promise<Contract> {
    return new Contract(this.contractAddress);
  }

  async submitMintPlayer(xdr: string) {
    const { txHash } =
      await this.stellarTransactionAdapter.submitSorobanTransaction(xdr);
    return txHash;
  }

  getAddress(addressValue: xdr.ScAddress): Address {
    return Address.fromScAddress(addressValue);
  }
}
