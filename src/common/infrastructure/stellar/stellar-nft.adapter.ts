import { CreatePlaceBIdDto } from '@module/auction/application/dto/create-place-bid.dto';
import { PlayerService } from '@module/player/application/service/player.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Account,
  Address,
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  nativeToScVal,
} from '@stellar/stellar-sdk';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { TransactionResponseAdapter } from '@common/infrastructure/stellar/application/adapter/transaction-response.adapter';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { CreateNFTDtoWithFIle } from '@common/infrastructure/stellar/dto/create-nft.dto';
import { TransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
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
  private readonly BASE_TIMEOUT: number = 300;
  private readonly tokenAddress: string;
  constructor(
    private readonly environmentConfig: ConfigService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    private readonly stellarAccountAdapter: StellarAccountAdapter,
    private readonly transactionResponseAdapter: TransactionResponseAdapter,
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly transactionMapper: TransactionMapper,
    private readonly sorobanContractAdapter: SorobanContractAdapter,
  ) {
    this.networkPassphrase = this.environmentConfig.get(
      'stellar.networkPassphrase',
    );
    this.code = this.environmentConfig.get('stellar.defaultAssetCode');
    this.tokenAddress = this.environmentConfig.get(
      'stellar.nativeAssetAddress',
    );
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

  async createAuctionTransaction(
    userPublickey: string,
    playerAddress: string,
    startingPrice: number,
    auctionTimeMs: number,
  ) {
    const contract = await this.sorobanContractAdapter.getContract();
    const account = await this.stellarAccountAdapter.getAccount(userPublickey);

    const userPublickeySC = nativeToScVal(Address.fromString(userPublickey));
    const playerAddressSC = nativeToScVal(Address.fromString(playerAddress));
    const startingPriceSC = nativeToScVal(startingPrice, { type: 'i128' });
    const auctionTimeMsSC = nativeToScVal(auctionTimeMs, { type: 'u64' });

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'create_auction',
          userPublickeySC,
          playerAddressSC,
          startingPriceSC,
          auctionTimeMsSC,
        ),
      )
      .setTimeout(400)
      .build();
    return await this.stellarTransactionAdapter.prepareTransaction(
      transaction.toXDR(),
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

  async getBalanceNFT(publicKey: string, issuer: string) {
    const account = await this.stellarAccountAdapter.getAccount(publicKey);
    return account.balances.some((balance) => {
      if (
        balance.asset_type === 'credit_alphanum4' &&
        `${balance.asset_code}:${balance.asset_issuer}` ===
          `${this.code}:${issuer}`
      ) {
        return +balance.balance > 0;
      }
      return false;
    });
  }

  async placeBid(
    userPublickey: string,
    createPlaceBIdDto: CreatePlaceBIdDto,
    auctionExternalId: number,
  ): Promise<string> {
    const contract = await this.sorobanContractAdapter.getContract();
    const account = await this.stellarAccountAdapter.getAccount(userPublickey);
    const auctionIdScVal = nativeToScVal(auctionExternalId, {
      type: 'u128',
    });
    const bidderAddressSCVal = nativeToScVal(Address.fromString(userPublickey));
    const bidAmountSCVal = nativeToScVal(createPlaceBIdDto.bidAmount, {
      type: 'i128',
    });
    const tokenAddressSCVal = nativeToScVal(
      Address.fromString(this.tokenAddress),
    );
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'place_bid',
          auctionIdScVal,
          bidderAddressSCVal,
          bidAmountSCVal,
          tokenAddressSCVal,
        ),
      )
      .setTimeout(this.BASE_TIMEOUT)
      .build();
    return await this.stellarTransactionAdapter.prepareTransaction(
      transaction.toXDR(),
    );
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
