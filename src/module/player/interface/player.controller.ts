import { PlayerFieldsQueryParamsDto } from '@module/player/application/dto/params/player-fields-query-params.dto';
import { PlayerFilterQueryParamsDto } from '@module/player/application/dto/params/player-filter-query-params.dto';
import { PlayerIncludeQueryParamsDto } from '@module/player/application/dto/params/player-include-query-params.dto';
import { PlayerSortQueryParamsDto } from '@module/player/application/dto/params/player-sort-query-params.dto';
import { PlayerResponseUpdateDto } from '@module/player/application/dto/player-response-update-dto';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { SubmitMintPlayerDto } from '@module/player/application/dto/submit-mint-player.dto';
import { PlayerService } from '@module/player/application/service/player.service';
import { PLAYER_ENTITY_NAME } from '@module/player/domain/player.name';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { CreateNFTDto } from '@common/infrastructure/stellar/dto/create-nft.dto';
import { TransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';
import { StellarNftAdapter } from '@common/infrastructure/stellar/stellar-nft.adapter';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@iam/user/domain/user.entity';

@Auth(AuthType.Bearer)
@ControllerEntity(PLAYER_ENTITY_NAME)
@Controller('/player')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly stellarNFTAdapter: StellarNftAdapter,
  ) {}
  @Get()
  getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: PlayerFilterQueryParamsDto,
    @Query('fields') fields: PlayerFieldsQueryParamsDto,
    @Query('sort') sort: PlayerSortQueryParamsDto,
    @Query('include') include: PlayerIncludeQueryParamsDto,
  ): Promise<ManySerializedResponseDto<PlayerResponseDto>> {
    return this.playerService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.target ?? [],
    });
  }

  @Get('/:id')
  getPlayerById(
    @Param('id') id: number,
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    return this.playerService.getOneById(id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('/mint')
  async mintPlayer(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body() createNFTDto: CreateNFTDto,
  ): Promise<OneSerializedResponseDto<TransactionNFTDto>> {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }
    const createNFTDtoWithFile = {
      ...createNFTDto,
      file,
    };
    return await this.stellarNFTAdapter.createPlayerNFTTransaction(
      createNFTDtoWithFile,
      user.publicKey,
    );
  }

  @Post('/submit/mint')
  async submitMintPlayer(
    @Body() submitMintPlayerDto: SubmitMintPlayerDto,
    @CurrentUser() currentUser: User,
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    return await this.playerService.submitMintPlayerXdr(
      currentUser,
      submitMintPlayerDto,
    );
  }

  @Post('/sac/:id')
  async mintPlayerSac(
    @Param('id') id: number,
    @CurrentUser() user: User,
  ): Promise<OneSerializedResponseDto<TransactionXDRDTO>> {
    return this.playerService.createStellarAssetContract(id, user);
  }

  @Post('/submit/sac/:id')
  async submitPlayerSac(
    @Param('id') id: number,
    @Body() transactionXDRDTO: TransactionXDRDTO,
  ): Promise<OneSerializedResponseDto<PlayerResponseDto>> {
    return this.playerService.submitSACXdr(id, transactionXDRDTO);
  }

  @Patch('/sync/team')
  async syncUserPlayersWithBlockchain(
    @CurrentUser() user: User,
  ): Promise<OneSerializedResponseDto<PlayerResponseUpdateDto>> {
    return await this.playerService.syncUserPlayersWithBlockchain(user);
  }
}
