import { AuctionResponseDto } from '@module/auction/application/dto/auction.response.dto';
import { CreateAuctionDto } from '@module/auction/application/dto/create-auction.dto';
import { CreateTransactionAuctionDto } from '@module/auction/application/dto/create-transaction-auction.dto';
import { AuctionFieldsQueryParamsDto } from '@module/auction/application/dto/params/auction-fields-query-params.dto';
import { AuctionFilterQueryParamsDto } from '@module/auction/application/dto/params/auction-filter-query-params.dto';
import { AuctionIncludeQueryParamsDto } from '@module/auction/application/dto/params/auction-include-query-params.dto';
import { AuctionSortQueryParamsDto } from '@module/auction/application/dto/params/query-sort-query-params.dto';
import { AuctionService } from '@module/auction/application/service/auction.service';
import { AUCTION_ENTITY_NAME } from '@module/auction/domain/auction.name';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@iam/user/domain/user.entity';

@Auth(AuthType.Bearer)
@ControllerEntity(AUCTION_ENTITY_NAME)
@Controller('/auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  getAll(
    @CurrentUser() user: User,
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: AuctionFilterQueryParamsDto,
    @Query('fields') fields: AuctionFieldsQueryParamsDto,
    @Query('sort') sort: AuctionSortQueryParamsDto,
    @Query('include') include: AuctionIncludeQueryParamsDto,
  ): Promise<ManySerializedResponseDto<AuctionResponseDto>> {
    return this.auctionService.getAll(user, {
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.target ?? [],
    });
  }

  @Get('/:id')
  getPlayerById(
    @CurrentUser() user: User,
    @Param('id') id: number,
  ): Promise<PlayerResponseDto> {
    return this.auctionService.getOneById(user, id);
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

  @Post('/submit/transaction')
  async submitCreateAuctionTransaction(
    @Body() createAuctionDto: CreateAuctionDto,
  ): Promise<OneSerializedResponseDto<AuctionResponseDto>> {
    console.info(createAuctionDto, 'createAuctionDto');
    return this.auctionService.saveOne(createAuctionDto);
  }
}
