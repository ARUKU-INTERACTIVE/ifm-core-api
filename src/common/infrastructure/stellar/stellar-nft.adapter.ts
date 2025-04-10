import { PlayerService } from '@module/player/application/service/player.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Account,
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { TransactionResponseAdapter } from '@common/infrastructure/stellar/application/adapter/transaction-response.adapter';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { CreateNFTDtoWithFIle } from '@common/infrastructure/stellar/dto/create-nft.dto';
import { TransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

@Injectable()
export class StellarNftAdapter {
  private readonly networkPassphrase: string;
  private readonly code: string;
  private readonly stroop = '0.0000001';
  private readonly homeDomain: string;
  private readonly ipfshash: string = 'ipfshash';
  private readonly startingBalance: string = '1.5';
  constructor(
    private readonly environmentConfig: ConfigService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    private readonly stellarAccountAdapter: StellarAccountAdapter,
    private readonly transactionResponseAdapter: TransactionResponseAdapter,
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly transactionMapper: TransactionMapper,
  ) {
    this.networkPassphrase = this.environmentConfig.get(
      'stellar.networkPassphrase',
    );
    this.code = this.environmentConfig.get('stellar.defaultAssetCode');
    this.homeDomain = this.environmentConfig.get('stellar.homeDomain');
  }

  createAsset(publicKey: string): Asset {
    return new Asset(this.code, publicKey);
  }

  async createPlayerNFTTransaction(
    createNFTDtoWithFIle: CreateNFTDtoWithFIle,
    ownerPublicKey: string,
  ): Promise<OneSerializedResponseDto<TransactionNFTDto>> {
    const issuer = this.stellarAccountAdapter.createIssuerKeypair();
    const issuerPublicKey = issuer.publicKey();

    const nftAsset = this.createAsset(issuerPublicKey);

    const uploadedPlayer = await this.playerService.uploadPlayerMetadata({
      ...createNFTDtoWithFIle,
      code: nftAsset.code,
      issuer: issuerPublicKey,
    });
    const { metadataCid, imageCid } = uploadedPlayer;
    const ownerAccount =
      await this.stellarAccountAdapter.getAccount(ownerPublicKey);

    const { xdr } = await this.mintPlayerTransaction(
      ownerAccount,
      issuer,
      ownerPublicKey,
      metadataCid,
      nftAsset,
    );

    return this.transactionResponseAdapter.oneEntityResponse<TransactionNFTDto>(
      this.transactionMapper.fromTransactionToTransactionNFTDto(
        xdr,
        metadataCid,
        imageCid,
        issuer.publicKey(),
      ),
    );
  }

  async mintPlayerTransaction(
    account: Account,
    issuer: Keypair,
    ownerPublicKey: string,
    metadataCID: string,
    nftAsset: Asset,
  ): Promise<TransactionXDRDTO> {
    const issuerPublicKey = issuer.publicKey();
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.createAccount({
          destination: issuerPublicKey,
          startingBalance: this.startingBalance,
        }),
      )
      .addOperation(
        Operation.manageData({
          name: this.ipfshash,
          value: metadataCID,
          source: issuerPublicKey,
        }),
      )
      .addOperation(
        Operation.changeTrust({
          asset: nftAsset,
          limit: this.stroop,
          source: ownerPublicKey,
        }),
      )
      .addOperation(
        Operation.payment({
          destination: ownerPublicKey,
          asset: nftAsset,
          amount: this.stroop,
          source: issuerPublicKey,
        }),
      )
      .addOperation(
        Operation.setOptions({
          masterWeight: 0,
          homeDomain: this.homeDomain,
          source: issuerPublicKey,
        }),
      )
      .setTimeout(400)
      .build();
    transaction.sign(issuer);

    return this.transactionMapper.fromXDRToTransactionDTO(transaction.toXDR());
  }

  async deployNFTStellarAssetContract(account: Account, nftAsset: Asset) {
    const sacTransaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.createStellarAssetContract({
          asset: nftAsset,
        }),
      )
      .setTimeout(400)
      .build();
    return await this.stellarTransactionAdapter.prepareTransaction(
      sacTransaction.toXDR(),
    );
  }
}
