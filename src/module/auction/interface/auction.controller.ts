import { AuctionResponseDto } from '@module/auction/application/dto/auction.response.dto';
import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { CreateTransactionAuctionDto } from '@module/auction/application/dto/create-transaction-auction.dto';
import { AuctionService } from '@module/auction/application/service/auction.service';
import { AUCTION_ENTITY_NAME } from '@module/auction/domain/auction.name';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';
import { StellarNftAdapter } from '@common/infrastructure/stellar/stellar-nft.adapter';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@iam/user/domain/user.entity';

@Auth(AuthType.Bearer)
@ControllerEntity(AUCTION_ENTITY_NAME)
@Controller('/auction')
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly stellarNFTAdapter: StellarNftAdapter,
  ) {}
  //  @Get()
  //  getAll(
  //    @Query('page') page: PageQueryParamsDto,
  //    @Query('filter') filter: PlayerFilterQueryParamsDto,
  //    @Query('fields') fields: PlayerFieldsQueryParamsDto,
  //    @Query('sort') sort: PlayerSortQueryParamsDto,
  //    @Query('include') include: PlayerIncludeQueryParamsDto,
  //  ): Promise<ManySerializedResponseDto<PlayerResponseDto>> {
  //    return this.playerService.getAll({
  //      page,
  //      filter,
  //      sort,
  //      fields: fields.target,
  //      include: include.target ?? [],
  //    });
  //  }

  @Get('/:id')
  getPlayerById(@Param('id') id: number): Promise<PlayerResponseDto> {
    return this.auctionService.getOneById(id);
  }

  @Post('/create/transaction')
  async createAuctionTransaction(
    @CurrentUser() user: User,
    @Body() createTransactionAuctionDto: CreateTransactionAuctionDto,
  ): Promise<OneSerializedResponseDto<TransactionXDRDTO>> {
    return this.auctionService.createAuctionTransaction(
      user,
      createTransactionAuctionDto,
    );
  }

  @Post('/create/submit/transaction')
  async submitCreateAuctionTransaction(
    @CurrentUser() user: User,
    @Body() createAuctionDto: CreateAuctionDto,
  ): Promise<OneSerializedResponseDto<AuctionResponseDto>> {
    return this.auctionService.saveOne(createAuctionDto);
  }
}
