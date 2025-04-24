import { PlayerResponseAdapter } from '@module/player/application/adapter/player-response.adapter';
import { UpdatePlayerRosterDto } from '@module/player/application/dto/add-player-roster.dto';
import { UpdatePlayerResponseDto } from '@module/player/application/dto/player-response-update-dto';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { SubmitMintPlayerDto } from '@module/player/application/dto/submit-mint-player.dto';
import { PlayerRelation } from '@module/player/application/enum/player-relations.enum';
import { PlayerMapper } from '@module/player/application/mapper/player.mapper';
import {
  IPlayerRepository,
  PLAYER_REPOSITORY_KEY,
} from '@module/player/application/repository/player.repository.interface';
import { Player } from '@module/player/domain/player.domain';
import {
  PlayerAddressAlreadyExistsException,
  PlayerNotOwnedByUserException,
} from '@module/player/infrastructure/database/exception/player.exception';
import { RosterRelation } from '@module/roster/application/enum/roster-relation.enum';
import { RosterService } from '@module/roster/application/service/roster.service';
import { TeamRelation } from '@module/team/application/enum/team-relation.enum';
import { TeamService } from '@module/team/application/service/team.service';
import { TeamBadRequestException } from '@module/team/infrastructure/database/exception/team-bad-request.exception';
import {
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import {
  FilterOptions,
  IGetAllOptions,
} from '@common/base/application/interface/get-all-options.interface';
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
import { UserNotRosterOwnerException } from '@iam/user/infrastructure/database/exception/user-not-roster-owner.exception';

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
    @Inject(forwardRef(() => RosterService))
    private readonly rosterService: RosterService,
    @Inject(forwardRef(() => StellarNftAdapter))
    private readonly stellarNFTAdapter: StellarNftAdapter,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
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

  async getPlayerEntity(
    filter: FilterOptions<Player>,
    relations?: PlayerRelation[],
  ): Promise<Player> {
    return await this.playerRepository.getOnePlayer(filter, relations);
  }

  async getPlayerResponse(
    filter: FilterOptions<Player>,
    relations?: PlayerRelation[],
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    const player = await this.playerRepository.getOnePlayer(filter, relations);
    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(player),
    );
  }

  async saveOnePlayer(player: Player) {
    return await this.playerRepository.saveOne(player);
  }

  async submitMintPlayerXdr(
    currentUser: User,
    submitMintPlayerDto: SubmitMintPlayerDto,
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    await this.sorobanContractAdapter.submitSorobanTransaction(
      submitMintPlayerDto.xdr,
    );

    const player =
      this.playerMapper.fromSubmitMintPlayerDtoToPlayer(submitMintPlayerDto);
    const team = await this.teamService.getOneByUserId(currentUser.id);
    const savedPlayer = await this.saveOnePlayer(
      this.playerMapper.fromCreatePlayerDtoToPlayer(player, team?.id),
    );
    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(savedPlayer),
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

  async syncUserPlayersWithBlockchain(
    currentUser: User,
  ): Promise<OneSerializedResponseDto<UpdatePlayerResponseDto>> {
    const ownedNftIssuers = await this.stellarNFTAdapter.getUserOwnedNftIssuers(
      currentUser.publicKey,
    );
    const team = await this.teamService.getOneByUserIdOrFail(currentUser.id, [
      TeamRelation.PLAYER_ENTITY,
    ]);

    const playersToAssignToTeam: Player[] = [];
    for (const issuer of ownedNftIssuers || []) {
      const player = await this.getPlayerEntity({
        issuer,
      });

      if (player && player.teamId !== team.id) {
        player.teamId = team.id;
        playersToAssignToTeam.push(player);
      }
    }

    const teamPlayersNotInUserWallet = team.players.filter(
      (player) => !ownedNftIssuers.includes(player.issuer),
    );

    const playersToRemoveFromTeam = teamPlayersNotInUserWallet.map(
      (player) => ({
        ...player,
        team: null,
        teamId: null,
        roster: null,
        rosterId: null,
      }),
    );

    await this.unsetPlayersFromTeam([
      ...playersToRemoveFromTeam,
      ...playersToAssignToTeam,
    ]);

    return this.playerResponseAdapter.oneEntityResponse<UpdatePlayerResponseDto>(
      this.playerMapper.fromPlayerCountToPlayerResponseUpdateDto(
        playersToAssignToTeam.length,
        playersToRemoveFromTeam.length,
      ),
    );
  }

  async unsetPlayersFromTeam(players: Player[]) {
    return await this.playerRepository.unsetPlayersFromTeam(players);
  }

  async addPlayerToRoster(
    user: User,
    updatePlayerRosterDto: UpdatePlayerRosterDto,
  ) {
    const team = await this.teamService.getOneByUserIdOrFail(user.id, [
      TeamRelation.ROSTER_ENTITY,
    ]);
    const player = await this.playerRepository.getOneByUuIdOrFail(
      updatePlayerRosterDto.playerId,
    );
    const playerIsOwnedByUser = await this.stellarNFTAdapter.checkNFTBalance(
      user.publicKey,
      player.issuer,
    );
    if (!playerIsOwnedByUser) {
      throw new PlayerNotOwnedByUserException();
    }
    if (player.teamId !== team.id) {
      throw new TeamBadRequestException({
        message: `The player with ID ${player.id} is not part of the team of the user with ID ${user.id}.`,
      });
    }
    const roster = await this.rosterService.getOneRosterOrFail(
      {
        uuid: updatePlayerRosterDto.rosterId,
      },
      [RosterRelation.Player],
    );
    if (team.id !== roster.teamId) {
      throw new UserNotRosterOwnerException();
    }

    if (player.rosterId && player.rosterId === roster.id) {
      throw new ConflictException(
        `Player with uuid ${player.uuid} is already assigned to roster uuid ${roster.uuid}`,
      );
    }
    if (roster.players.length >= this.rosterService.MAX_PLAYERS) {
      throw new ConflictException(
        `The roster already has the maximum of ${this.rosterService.MAX_PLAYERS} players.`,
      );
    }

    player.rosterId = roster.id;
    const savedPlayer = await this.saveOnePlayer(player);
    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(savedPlayer),
    );
  }

  async removePlayerFromRoster(
    user: User,
    updatePlayerRosterDto: UpdatePlayerRosterDto,
  ) {
    const player = await this.playerRepository.getOneByUuIdOrFail(
      updatePlayerRosterDto.playerId,
    );
    const roster = await this.rosterService.getOneRosterOrFail({
      uuid: updatePlayerRosterDto.rosterId,
    });

    const team = await this.teamService.getOneByUserIdOrFail(user.id, [
      TeamRelation.ROSTER_ENTITY,
    ]);
    if (team.id !== roster.teamId) {
      throw new UserNotRosterOwnerException();
    }

    player.rosterId = null;
    player.roster = null;
    const savedPlayer = await this.saveOnePlayer(player);

    return this.playerResponseAdapter.oneEntityResponse<PlayerResponseDto>(
      this.playerMapper.fromPlayerToPlayerResponseDto(savedPlayer),
    );
  }
}
