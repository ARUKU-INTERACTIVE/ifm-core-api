import { PlayerResponseAdapter } from '@module/player/application/adapter/player-response.adapter';
import { ICreatePlayerDto } from '@module/player/application/dto/create-player.dto.interface';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import {
  IPlayerRepository,
  PLAYER_REPOSITORY_KEY,
} from '@module/player/application/repository/player.repository.interface';
import { Player } from '@module/player/domain/player.domain';
import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ICollection } from '@common/base/application/dto/collection.interface';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { TransactionMapper } from '@common/infrastructure/stellar/application/mapper/transaction.mapper';
import { TransactionXDRResponseDto } from '@common/infrastructure/stellar/dto/transaction-xdr-response.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';
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
    user: User,
  ): Promise<ManySerializedResponseDto<PlayerResponseDto>> {
    const sourceAccount = await this.stellarAccountAdapter.getAccount(
      user.publicKey,
    );

    const collection = await this.playerRepository.getAll(options);
    const playersForSale: ICollection<Player> = {
      ...collection,
      data: await Promise.all(
        collection.data.map(async (player) => {
          const playerFromContract =
            await this.sorobanContractAdapter.getPlayer(
              sourceAccount,
              player.externalId,
            );

          return {
            ...player,
            isInAuction: playerFromContract?.is_in_auction ?? false,
          };
        }),
      ),
    };

    const collectionDto = new CollectionDto({
      ...collection,
      data: playersForSale.data.map((player) =>
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
    const { name, metadataUri } = createPlayerDto;
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
      metadataUri,
    );
    return this.playerResponseAdapter.oneEntityResponse(
      this.transactionMapper.fromXDRToTransactionDTO(transactionXDR),
    );
  }

  async submitMintPlayerXdr(
    transactionXDRDto: TransactionXDRDTO,
    currentUser: User,
  ): Promise<Player> {
    const txHash = await this.sorobanContractAdapter.submitMintPlayer(
      transactionXDRDto.xdr,
    );
    const playerDto =
      await this.sorobanContractAdapter.getPlayerFromTransaction(txHash);
    playerDto.ownerId = currentUser.id;

    const player = await this.playerRepository.saveOne(
      this.playerMapper.fromCreatePlayerDtoToPlayer(playerDto),
    );

    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(player),
      [PlayerRelation.OWNER],
    );
  }
}
