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
import { PinataAdapter } from '@common/infrastructure/ipfs/pinata.adapter';
import { TransactionResponseAdapter } from '@common/infrastructure/stellar/application/adapter/transaction-response.adapter';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { CreateNFTDtoWithFIle } from '@common/infrastructure/stellar/dto/create-nft.dto';
import { TransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';

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
    private readonly pinataAdapter: PinataAdapter,
    private readonly stellarAccountAdapter: StellarAccountAdapter,
    private readonly transactionResponseAdapter: TransactionResponseAdapter,
    private readonly transactionMapper: TransactionMapper,
  ) {
    this.networkPassphrase = this.environmentConfig.get(
      'stellar.networkPassphrase',
    );
    this.code = this.environmentConfig.get('stellar.codeMint');
    this.homeDomain = this.environmentConfig.get('stellar.homeDomain');
  }

  createAsset(publicKey: string): Asset {
    return new Asset(this.code, publicKey);
  }

  async createTransactionNFT(
    createNFTDtoWithFIle: CreateNFTDtoWithFIle,
    ownerPublicKey: string,
  ): Promise<OneSerializedResponseDto<TransactionNFTDto>> {
    const issuer = this.stellarAccountAdapter.createIssuerKeypair();
    const issuerPublicKey = issuer.publicKey();

    const nftAsset = this.createAsset(issuerPublicKey);

    const pinataPlayerCid =
      await this.pinataAdapter.getPinataMetadataAndImageCid({
        ...createNFTDtoWithFIle,
        code: nftAsset.code,
        issuer: issuerPublicKey,
      });
    const { metadataCid, imageCid } = pinataPlayerCid;
    const ownerAccount =
      await this.stellarAccountAdapter.getAccount(ownerPublicKey);

    const xdr = await this.createTransaction(
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

  async createTransaction(
    account: Account,
    issuer: Keypair,
    ownerPublicKey: string,
    metadataCID: string,
    nftAsset: Asset,
  ): Promise<string> {
    const issuerPublicKey = issuer.publicKey();

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.createAccount({
          destination: issuerPublicKey,
          startingBalance: this.startingBalance,
          source: ownerPublicKey,
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
      .setTimeout(180)
      .build();
    transaction.sign(issuer);
    return transaction.toXDR();
  }
}
