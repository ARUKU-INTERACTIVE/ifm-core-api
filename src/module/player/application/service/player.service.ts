import { PlayerResponseAdapter } from '@module/player/application/adapter/player-response.adapter';
import { ICreatePlayerDto } from '@module/player/application/dto/create-player.dto.interface';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { SubmitMintPlayerDto } from '@module/player/application/dto/submit-mint-player.dto';
import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import {
  IPlayerRepository,
  PLAYER_REPOSITORY_KEY,
} from '@module/player/application/repository/player.repository.interface';
import { Player } from '@module/player/domain/player.domain';
import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { TransactionXDRResponseDto } from '@common/infrastructure/stellar/dto/transaction-xdr-response.dto';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';

import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class PlayerService {
  constructor(
    @Inject(PLAYER_REPOSITORY_KEY)
    private readonly playerRepository: IPlayerRepository,
    private readonly playerResponseAdapter: PlayerResponseAdapter,
    private readonly playerMapper: PlayerMapper,
    private readonly transactionMapper: TransactionMapper,
    private readonly sorobanContractAdapter: SorobanContractAdapter,
    private readonly stellarAccountAdapter: StellarAccountAdapter,
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
  ): Promise<PlayerResponseDto> {
    const player = await this.playerRepository.getOneById(id, relations);
    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(player),
      [PlayerRelation.OWNER],
    );
  }

  async mintPlayerXDR(
    createPlayerDto: ICreatePlayerDto,
    user: User,
  ): Promise<OneSerializedResponseDto<TransactionXDRResponseDto>> {
    const { name, metadataCid } = createPlayerDto;
    const issuer = this.stellarAccountAdapter.createIssuerKeypair();
    const issuerPublicKey = issuer.publicKey();
    const sourceAccount = await this.stellarAccountAdapter.getAccount(
      user.publicKey,
    );

    const transactionXDR = await this.sorobanContractAdapter.mintPlayer(
      sourceAccount,
      issuerPublicKey,
      user.publicKey,
      name,
      metadataCid,
    );
    return this.playerResponseAdapter.oneEntityResponse(
      this.transactionMapper.fromXDRToTransactionDTO(transactionXDR),
    );
  }

  async submitMintPlayerXdr(
    submitMintPlayerDto: SubmitMintPlayerDto,
    currentUser: User,
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    await this.sorobanContractAdapter.submitMintPlayer(submitMintPlayerDto.xdr);
    const playerDto = this.playerMapper.fromSubmitMintPlayerDtoToPlayerDto(
      submitMintPlayerDto,
      currentUser.id,
    );

    const player = await this.playerRepository.saveOne(
      this.playerMapper.fromCreatePlayerDtoToPlayer(playerDto),
    );

    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(player),
      [PlayerRelation.OWNER],
    );
  }
}
