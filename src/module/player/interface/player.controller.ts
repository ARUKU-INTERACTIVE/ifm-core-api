import { CreatePlayerDto } from '@module/player/application/dto/create-player.dto';
import { PlayerFieldsQueryParamsDto } from '@module/player/application/dto/params/player-fields-query-params.dto';
import { PlayerFilterQueryParamsDto } from '@module/player/application/dto/params/player-filter-query-params.dto';
import { PlayerIncludeQueryParamsDto } from '@module/player/application/dto/params/player-include-query-params.dto';
import { PlayerSortQueryParamsDto } from '@module/player/application/dto/params/player-sort-query-params.dto';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerService } from '@module/player/application/service/player.service';
import { PLAYER_ENTITY_NAME } from '@module/player/domain/player.name';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { TransactionXDRResponseDto } from '@common/infrastructure/stellar/dto/transaction-xdr-response.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@iam/user/domain/user.entity';

@Auth(AuthType.Bearer)
@ControllerEntity(PLAYER_ENTITY_NAME)
@Controller('/player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get()
  getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: PlayerFilterQueryParamsDto,
    @Query('fields') fields: PlayerFieldsQueryParamsDto,
    @Query('sort') sort: PlayerSortQueryParamsDto,
    @Query('include') include: PlayerIncludeQueryParamsDto,
    @CurrentUser() user: User,
  ): Promise<ManySerializedResponseDto<PlayerResponseDto>> {
    return this.playerService.getAll(
      {
        page,
        filter,
        sort,
        fields: fields.target,
        include: include.target ?? [],
      },
      user,
    );
  }

  @Get('/:id')
  getPlayerById(@Param('id') id: number): Promise<PlayerResponseDto> {
    return this.playerService.getOneById(id);
  }

  @Post('/mint')
  async mintPlayer(
    @CurrentUser() user: User,
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<OneSerializedResponseDto<TransactionXDRResponseDto>> {
    const player = await this.playerService.mintPlayerXDR(
      createPlayerDto,
      user,
    );
    return player;
  }

  @Post('/submit/mint')
  async submitMintPlayer(
    @CurrentUser() user: User,
    @Body() transactionXDRDto: TransactionXDRDTO,
  ) {
    return await this.playerService.submitMintPlayerXdr(
      transactionXDRDto,
      user,
    );
  }
}
