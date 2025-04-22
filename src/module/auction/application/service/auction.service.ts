import { AuctionResponseAdapter } from '@module/auction/application/adapter/auction-response.adapter';
import { ISCAuctionDto } from '@module/auction/application/dto/auction-sc.dto.interface';
import { AuctionResponseDto } from '@module/auction/application/dto/auction.response.dto';
import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { CreatePlaceBIdDto } from '@module/auction/application/dto/create-place-bid.dto';
import { CreateAuctionTransactionDto } from '@module/auction/application/dto/create-transaction-auction.dto';
import { SubmitClaimDto } from '@module/auction/application/dto/submit-claim.dto';
import { SubmitPlaceBidDto } from '@module/auction/application/dto/submit-place-bid.dto';
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
import { TeamService } from '@module/team/application/service/team.service';
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
    private readonly teamService: TeamService,
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
    const isCurrentOwner = await this.stellarNFTAdapter.checkNFTBalance(
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

  async createPlaceBidTransaction(
    user: User,
    createPlaceBIdDto: CreatePlaceBIdDto,
  ): Promise<OneSerializedResponseDto<TransactionXDRDTO>> {
    const auctionId = createPlaceBIdDto.auctionId;
    const auction = await this.auctionRepository.getOneById(auctionId);

    if (!auction) {
      throw new NotFoundException(`Auction with ${auctionId} not found`);
    }

    const xdr = await this.stellarNFTAdapter.createPlaceBidTransaction(
      user.publicKey,
      createPlaceBIdDto,
      auction.externalId,
    );

    return this.auctionResponseAdapter.oneEntityResponse<TransactionXDRDTO>(
      this.transactionMapper.fromXDRToTransactionDTO(xdr),
    );
  }

  async submitPlaceBidTransaction(
    submitPlaceBidDto: SubmitPlaceBidDto,
  ): Promise<OneSerializedResponseDto<AuctionResponseDto>> {
    const txHash = await this.sorobanContractAdapter.submitSorobanTransaction(
      submitPlaceBidDto.xdr,
    );
    const auctionId = submitPlaceBidDto.auctionId;

    const auction = await this.auctionRepository.getOneById(auctionId);

    if (!auction) {
      throw new NotFoundException(`Auction with ${auctionId} not found`);
    }
    const { returnValue } =
      await this.stellarTransactionAdapter.getSorobanTransaction(txHash);

    const txReturnValue = returnValue as unknown as xdr.ScVal;

    const auctionSC: ISCAuctionDto = scValToNative(txReturnValue);
    return this.auctionResponseAdapter.oneEntityResponse<AuctionResponseDto>(
      this.auctionMapper.fromAuctionToAuctionResponseDto(auction, auctionSC),
    );
  }

  async createClaimTransaction(publicKey: string, auctionId: number) {
    const auction = await this.auctionRepository.getOneById(auctionId, [
      AuctionRelation.PLAYER,
    ]);

    if (!auction) {
      throw new NotFoundException(`Auction with ${auctionId} not found`);
    }
    const xdr = await this.stellarNFTAdapter.createClaimTransaction(
      publicKey,
      auction.externalId,
    );

    return this.auctionResponseAdapter.oneEntityResponse<TransactionXDRDTO>(
      this.transactionMapper.fromXDRToTransactionDTO(xdr),
    );
  }

  async submitClaimTransaction(
    currentUser: User,
    submitClaimDto: SubmitClaimDto,
  ) {
    const auctionId = submitClaimDto.auctionId;
    const auction = await this.auctionRepository.getOneById(auctionId);

    if (!auction) {
      throw new NotFoundException(`Auction with ${auctionId} not found`);
    }
    await this.sorobanContractAdapter.submitSorobanTransaction(
      submitClaimDto.xdr,
    );

    const account = await this.stellarAccountAdapter.getAccount(
      currentUser.publicKey,
    );

    const auctionSc = await this.sorobanContractAdapter.getAuction(
      account,
      auction.externalId,
    );
    const team = await this.teamService.getOneByUserId(currentUser.id);
    const player = await this.playerService.getPlayerEntity({
      address: auctionSc.player_address,
    });
    if (team) {
      player.teamId = team.id;
    } else {
      player.teamId = null;
      player.team = null;
    }
    await this.playerService.saveOnePlayer(player);
    return this.auctionResponseAdapter.oneEntityResponse<AuctionResponseDto>(
      this.auctionMapper.fromAuctionToAuctionResponseDto(auction, auctionSc),
    );
  }
}
