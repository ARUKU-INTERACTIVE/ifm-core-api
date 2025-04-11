import { AuctionResponseAdapter } from '@module/auction/application/adapter/auction-response.adapter';
import { AuctionResponseDto } from '@module/auction/application/dto/auction.response.dto';
import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { CreateAuctionTransactionDto } from '@module/auction/application/dto/create-transaction-auction.dto';
import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { AuctionMapper } from '@module/auction/application/mapper/auction.mapper';
import {
  AUCTION_REPOSITORY_KEY,
  IAuctionRepository,
} from '@module/auction/application/repository/auction.repository.interface';
import { Auction } from '@module/auction/domain/auction.domain';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerService } from '@module/player/application/service/player.service';
import { PlayerNotOwnedByUserException } from '@module/player/infrastructure/database/exception/player.exception';
import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { scValToNative, xdr } from '@stellar/stellar-sdk';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';
import { StellarNftAdapter } from '@common/infrastructure/stellar/stellar-nft.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class AuctionService {
  constructor(
    @Inject(AUCTION_REPOSITORY_KEY)
    private readonly auctionRepository: IAuctionRepository,
    private readonly auctionResponseAdapter: AuctionResponseAdapter,
    private readonly auctionMapper: AuctionMapper,
    private readonly playerService: PlayerService,
    private readonly transactionMapper: TransactionMapper,
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly sorobanContractAdapter: SorobanContractAdapter,
    private readonly stellarAccountAdapter: StellarAccountAdapter,
    @Inject(forwardRef(() => StellarNftAdapter))
    private readonly stellarNFTAdapter: StellarNftAdapter,
  ) {}

  async getAll(
    user: User,
    options: IGetAllOptions<Auction, AuctionRelation[]>,
  ): Promise<ManySerializedResponseDto<AuctionResponseDto>> {
    const collection = await this.auctionRepository.getAll(options);
    const sourceAccount = await this.stellarAccountAdapter.getAccount(
      user.publicKey,
    );
    const collectionData = await Promise.all(
      collection.data.map(async (auction) => {
        const auctionSc = await this.sorobanContractAdapter.getAuction(
          sourceAccount,
          auction.externalId,
        );
        return this.auctionMapper.fromAuctionToAuctionResponseDto(
          auction,
          auctionSc,
        );
      }),
    );
    const collectionDto = new CollectionDto({
      ...collection,
      data: collectionData,
    });

    return this.auctionResponseAdapter.manyEntitiesResponse<AuctionResponseDto>(
      collectionDto,
      options.include,
    );
  }

  async getOneById(
    user: User,
    id: number,
    relations?: AuctionRelation[],
  ): Promise<PlayerResponseDto> {
    const auction = await this.auctionRepository.getOneById(id, relations);
    const sourceAccount = await this.stellarAccountAdapter.getAccount(
      user.publicKey,
    );

    const auctionSC = await this.sorobanContractAdapter.getAuction(
      sourceAccount,
      id,
    );

    if (!auction) {
      throw new NotFoundException(`Auction with id ${id} not found`);
    }
    return this.auctionResponseAdapter.oneEntityResponse<AuctionResponseDto>(
      this.auctionMapper.fromAuctionToAuctionResponseDto(auction, auctionSC),
      [AuctionRelation.PLAYER],
    );
  }

  async createAuctionTransaction(
    user: User,
    createTransactionAuctionDto: CreateAuctionTransactionDto,
  ): Promise<OneSerializedResponseDto<TransactionXDRDTO>> {
    const player = await this.playerService.getOneById(
      createTransactionAuctionDto.playerId,
    );
    const isCurrentOwner = await this.stellarNFTAdapter.getBalanceNFT(
      user.publicKey,
      player.data.attributes.issuer,
    );
    if (!isCurrentOwner) {
      throw new PlayerNotOwnedByUserException();
    }
    const xdr = await this.stellarNFTAdapter.createAuctionTransaction(
      user.publicKey,
      player.data.attributes.address,
      createTransactionAuctionDto.startingPrice,
      createTransactionAuctionDto.auctionTimeMs,
    );
    return this.auctionResponseAdapter.oneEntityResponse<TransactionXDRDTO>(
      this.transactionMapper.fromXDRToTransactionDTO(xdr),
    );
  }

  async saveOne(
    createAuctionDto: CreateAuctionDto,
  ): Promise<OneSerializedResponseDto<AuctionResponseDto>> {
    const txHash = await this.sorobanContractAdapter.submitSorobanTransaction(
      createAuctionDto.xdr,
    );
    const { returnValue } =
      await this.stellarTransactionAdapter.getSorobanTransaction(txHash);

    const txReturnValue = returnValue as unknown as xdr.ScVal;

    const auctionSC = scValToNative(txReturnValue);
    createAuctionDto.externalId = Number(auctionSC.id);
    const auction =
      this.auctionMapper.fromCreateAuctionDtoToAuction(createAuctionDto);
    const savedAuction = await this.auctionRepository.saveOne(auction);
    return this.auctionResponseAdapter.oneEntityResponse<AuctionResponseDto>(
      this.auctionMapper.fromAuctionToAuctionResponseDto(
        savedAuction,
        auctionSC,
      ),
      [AuctionRelation.PLAYER],
    );
  }
}
