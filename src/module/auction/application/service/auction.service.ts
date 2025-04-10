import { AuctionResponseAdapter } from '@module/auction/application/adapter/auction-response.adapter';
import { AuctionResponseDto } from '@module/auction/application/dto/auction.response.dto';
import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { CreateTransactionAuctionDto } from '@module/auction/application/dto/create-transaction-auction.dto';
import { AuctionRelation } from '@module/auction/application/enum/auction-relations.enum';
import { AuctionMapper } from '@module/auction/application/mapper/auction.mapper';
import {
  AUCTION_REPOSITORY_KEY,
  IAuctionRepository,
} from '@module/auction/application/repository/auction.repository.interface';
import { Auction } from '@module/auction/domain/auction.domain';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { PlayerService } from '@module/player/application/service/player.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
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
    options: IGetAllOptions<Auction, AuctionRelation[]>,
  ): Promise<ManySerializedResponseDto<AuctionResponseDto>> {
    const collection = await this.auctionRepository.getAll(options);

    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((auction) =>
        this.auctionMapper.fromAuctionToAuctionResponseDto(auction),
      ),
    });

    return this.auctionResponseAdapter.manyEntitiesResponse<AuctionResponseDto>(
      collectionDto,
      options.include,
    );
  }

  async getOneById(
    id: number,
    relations?: AuctionRelation[],
  ): Promise<PlayerResponseDto> {
    const auction = await this.auctionRepository.getOneById(id, relations);
    return this.auctionResponseAdapter.oneEntityResponse<AuctionResponseDto>(
      this.auctionMapper.fromAuctionToAuctionResponseDto(auction),
      [AuctionRelation.PLAYER],
    );
  }

  async createAuctionTransaction(
    user: User,
    createTransactionAuctionDto: CreateTransactionAuctionDto,
  ): Promise<OneSerializedResponseDto<TransactionXDRDTO>> {
    const player = await this.playerService.getOneById(
      createTransactionAuctionDto.playerId,
      [PlayerRelation.OWNER],
    );
    const currrentOwnerId = +player.data.relationships.owner.data.id;
    if (currrentOwnerId !== user.id) {
      throw new Error('Player not owned by user');
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
    const txHash = await this.sorobanContractAdapter.submitMintPlayer(
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
      this.auctionMapper.fromAuctionToAuctionResponseDto(savedAuction),
      [AuctionRelation.PLAYER],
    );
  }
}
