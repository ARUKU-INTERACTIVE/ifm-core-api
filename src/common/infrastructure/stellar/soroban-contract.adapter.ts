import { PlayerDto } from '@module/player/application/dto/player.dto';
import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
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

import { ISCPlayerDto } from '@common/infrastructure/stellar/dto/player-sc.dto';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

@Injectable()
export class SorobanContractAdapter {
  private readonly BASE_TIMEOUT = 180;
  private readonly sorobanServer: rpc.Server;
  private readonly networkPassphrase: string;
  private readonly contractAddress: string;

  constructor(
    private readonly environmentConfig: ConfigService,
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly playerMapper: PlayerMapper,
  ) {
    this.networkPassphrase = this.environmentConfig.get(
      'stellar.networkPassphrase',
    );
    const sorobanServerUrl = this.environmentConfig.get('soroban.serverUrl');
    this.sorobanServer = new rpc.Server(sorobanServerUrl, {
      allowHttp: true,
    });
    this.contractAddress = this.environmentConfig.get(
      'soroban.contractAddress',
    );
  }

  async getContract(): Promise<Contract> {
    return new Contract(this.contractAddress);
  }

  async mintPlayer(
    sourceAccount: Account,
    issuerAddress: string,
    sourcePublicKey: string,
    name: string,
    metadataUri: string,
  ): Promise<string> {
    const contract = await this.getContract();
    const sourceScAddressScVal = nativeToScVal(
      Address.fromString(sourcePublicKey),
    );
    const issuerScAddressScVal = nativeToScVal(
      Address.fromString(issuerAddress),
    );
    const nameScVal = nativeToScVal(name);
    const urlScVal = nativeToScVal(metadataUri);

    const buildTransaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'mint_player',
          sourceScAddressScVal,
          issuerScAddressScVal,
          nameScVal,
          urlScVal,
        ),
      )
      .setTimeout(this.BASE_TIMEOUT)
      .build();
    const preparedTransaction =
      await this.sorobanServer.prepareTransaction(buildTransaction);
    return preparedTransaction.toXDR();
  }

  async submitMintPlayer(xdr: string) {
    const { txHash } =
      await this.stellarTransactionAdapter.submitSorobanTransaction(xdr);
    return txHash;
  }

  async getPlayerFromTransaction(txHash: string): Promise<PlayerDto> {
    const { returnValue } =
      await this.stellarTransactionAdapter.getSorobanTransaction(txHash);
    const txReturnValue = returnValue as unknown as xdr.ScVal;
    const player: ISCPlayerDto = scValToNative(txReturnValue);
    return this.playerMapper.fromSCPlayerDtoToPlayer(player);
  }
}
