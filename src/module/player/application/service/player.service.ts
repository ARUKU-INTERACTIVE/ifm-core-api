import { PlayerResponseAdapter } from '@module/player/application/adapter/player-response.adapter';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { SubmitMintPlayerDto } from '@module/player/application/dto/submit-mint-player.dto';
import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import {
  IPlayerRepository,
  PLAYER_REPOSITORY_KEY,
} from '@module/player/application/repository/player.repository.interface';
import { Player } from '@module/player/domain/player.domain';
import { PlayerAddressAlreadyExistsException } from '@module/player/infrastructure/database/exception/player.exception';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { IPinataPlayerCid } from '@common/infrastructure/ipfs/application/interfaces/pinata-player-cid.interface';
import { PinataAdapter } from '@common/infrastructure/ipfs/pinata.adapter';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { CreateNFTDtoComplete } from '@common/infrastructure/stellar/dto/create-nft.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';
import { StellarNftAdapter } from '@common/infrastructure/stellar/stellar-nft.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar-transaction.adapter';

import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class PlayerService {
  constructor(
    @Inject(PLAYER_REPOSITORY_KEY)
    private readonly playerRepository: IPlayerRepository,
    private readonly playerResponseAdapter: PlayerResponseAdapter,
    private readonly playerMapper: PlayerMapper,
    private readonly transactionMapper: TransactionMapper,
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly sorobanContractAdapter: SorobanContractAdapter,
    private readonly stellarAccountAdapter: StellarAccountAdapter,
    private readonly pinataAdapter: PinataAdapter,
    @Inject(forwardRef(() => StellarNftAdapter))
    private readonly stellarNFTAdapter: StellarNftAdapter,
  ) {}

  async getAll(
    options: IGetAllOptions<Player, PlayerRelation[]>,
  ): Promise<ManySerializedResponseDto<PlayerResponseDto>> {
    const collection = await this.playerRepository.getAll(options);

    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((player) =>
        this.playerMapper.fromPlayerToPlayerResponseDto(player),
      ),
    });

    return this.playerResponseAdapter.manyEntitiesResponse<PlayerResponseDto>(
      collectionDto,
      options.include,
    );
  }

  async getOneById(
    id: number,
    relations?: PlayerRelation[],
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    const player = await this.playerRepository.getOneById(id, relations);
    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(player),
    );
  }

  async submitMintPlayerXdr(
    submitMintPlayerDto: SubmitMintPlayerDto,
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    await this.sorobanContractAdapter.submitSorobanTransaction(
      submitMintPlayerDto.xdr,
    );
    const playerDto =
      this.playerMapper.fromSubmitMintPlayerDtoToPlayer(submitMintPlayerDto);
    const player = await this.playerRepository.saveOne(
      this.playerMapper.fromCreatePlayerDtoToPlayer(playerDto),
    );

    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(player),
    );
  }

  async uploadPlayerMetadata(
    createNFTDtoComplete: CreateNFTDtoComplete,
  ): Promise<IPinataPlayerCid> {
    const imageUploadResult = await this.pinataAdapter.uploadFIle(
      createNFTDtoComplete.file,
    );
    const imageCid = imageUploadResult.cid;
    const metadataPayload = {
      name: createNFTDtoComplete.name,
      description: createNFTDtoComplete.description,
      image: `https://${this.pinataAdapter.pinataGatewayUrl}/ipfs/${imageCid}`,
      issuer: createNFTDtoComplete.issuer,
      code: createNFTDtoComplete.code,
    };
    const metadataUploadResult =
      await this.pinataAdapter.uploadJson(metadataPayload);
    return {
      metadataCid: metadataUploadResult.cid,
      imageCid: imageCid,
    };
  }

  async createStellarAssetContract(
    playerId: number,
    currentUser: User,
  ): Promise<OneSerializedResponseDto<TransactionXDRDTO>> {
    const player = await this.playerRepository.getOneById(playerId);
    if (player.address) {
      throw new PlayerAddressAlreadyExistsException();
    }

    const account = await this.stellarAccountAdapter.getAccount(
      currentUser.publicKey,
    );
    const issuerPublicKey = player.issuer;
    const nftAsset = this.stellarNFTAdapter.createAsset(issuerPublicKey);
    const xdr = await this.stellarNFTAdapter.deployNFTStellarAssetContract(
      account,
      nftAsset,
    );
    return this.playerResponseAdapter.oneEntityResponse<TransactionXDRDTO>(
      this.transactionMapper.fromXDRToTransactionDTO(xdr),
    );
  }

  async submitSACXdr(
    playerId: number,
    transactionXDRDTO: TransactionXDRDTO,
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    const player = await this.playerRepository.getOneById(playerId);

    if (player.address) {
      throw new PlayerAddressAlreadyExistsException();
    }

    const txHash = await this.sorobanContractAdapter.submitSorobanTransaction(
      transactionXDRDTO.xdr,
    );
    const { returnValue } =
      await this.stellarTransactionAdapter.getSorobanTransaction(txHash);
    const playerAddress = this.sorobanContractAdapter.getAddress(
      returnValue.address(),
    );

    player.address = playerAddress.toString();

    const savedPlayer = await this.playerRepository.saveOne(player);
    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(savedPlayer),
    );
  }
}
