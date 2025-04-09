import { PlayerService } from '@module/player/application/service/player.service';
import { Injectable } from '@nestjs/common';
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
import { MintPlayerTransactionsXDRDto } from '@common/infrastructure/stellar/dto/mint-player-transactions-xdr.dto';
import { TransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto';
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

    const mintPlayerTransactionsXDR = await this.mintPlayerTransaction(
      ownerAccount,
      issuer,
      ownerPublicKey,
      metadataCid,
      nftAsset,
    );
    return this.transactionResponseAdapter.oneEntityResponse<TransactionNFTDto>(
      this.transactionMapper.fromTransactionToTransactionNFTDto(
        mintPlayerTransactionsXDR,
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
  ): Promise<MintPlayerTransactionsXDRDto> {
    const issuerPublicKey = issuer.publicKey();
    try {
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
        .setTimeout(400)
        .build();

      const sacTransaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.createStellarAssetContract({
            asset: nftAsset,
            source: issuerPublicKey,
          }),
        )
        .setTimeout(400)
        .build();
      const sacSorobanTransactionXDR =
        await this.stellarTransactionAdapter.prepareTransaction(
          sacTransaction.toXDR(),
        );
      const sacSorobanTransaction =
        this.stellarTransactionAdapter.buildTransactionFromXdr(
          sacSorobanTransactionXDR,
        );
      const disableMasterKeyTransaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
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
      sacSorobanTransaction.sign(issuer);
      disableMasterKeyTransaction.sign(issuer);

      return this.transactionMapper.fromMintPlayerTransactionsToXDRDto(
        transaction.toXDR(),
        sacSorobanTransaction.toXDR(),
        disableMasterKeyTransaction.toXDR(),
      );
    } catch (error) {
      console.log(error, 'error');
      throw new Error('Failed to create mint player transaction');
    }
  }

  async createStellarAssetContract(
    issuerAccount: Account,
    nftAsset: Asset,
    issuer: Keypair,
  ) {
    const transaction = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.createStellarAssetContract({
          asset: nftAsset,
          source: issuer.publicKey(),
        }),
      )
      .setTimeout(60)
      .build();
    transaction.sign(issuer);
    return transaction.toXDR();
  }
}
