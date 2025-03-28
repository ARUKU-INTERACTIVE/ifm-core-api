import { CreatePlayerDto } from '@module/player/application/dto/create-player.dto';
import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerService } from '@module/player/application/service/player.service';
import { PLAYER_ENTITY_NAME } from '@module/player/domain/player.name';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
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

  @Get('/:id')
  getPlayerById(@Param('id') id: number): Promise<PlayerResponseDto> {
    return this.playerService.getOneById(id);
  }

  @Post('/mint')
  async mintPlayer(
    @CurrentUser() user: User,
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<OneSerializedResponseDto<TransactionXDRResponseDto>> {
    return await this.playerService.mintPlayerXDR(createPlayerDto, user);
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
