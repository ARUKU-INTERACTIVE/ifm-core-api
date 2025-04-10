import { ISCAuctionDto } from '@module/auction/application/dto/auction-sc.dto.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';

import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

@Injectable()
export class SorobanContractAdapter {
  private readonly contractAddress: string;
  private readonly BASE_TIMEOUT: number = 30;
  private readonly sorobanServer: rpc.Server;
  private readonly networkPassphrase: string;

  constructor(
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly environmentConfig: ConfigService,
  ) {
    this.contractAddress = this.environmentConfig.get(
      'soroban.contractAddress',
    );
    const sorobanServerUrl = this.environmentConfig.get('soroban.serverUrl');
    this.networkPassphrase = this.environmentConfig.get(
      'stellar.networkPassphrase',
    );
    this.sorobanServer = new rpc.Server(sorobanServerUrl, { allowHttp: true });
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

  async getAuction(
    sourceAccount: Account,
    auctionId: number,
  ): Promise<ISCAuctionDto> {
    const contract = await this.getContract();
    const auctionIdScVal = nativeToScVal(auctionId, { type: 'u128' });
    const buildTransaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call('get_auction', auctionIdScVal))
      .setTimeout(this.BASE_TIMEOUT)
      .build();

    const simulateResponse =
      await this.sorobanServer._simulateTransaction(buildTransaction);
    if (!simulateResponse.results?.[0]) {
      return null;
    }
    const responseXDR = simulateResponse.results[0].xdr;
    const scVal = xdr.ScVal.fromXDR(responseXDR, 'base64');
    return scValToNative(scVal) as ISCAuctionDto;
  }
}
