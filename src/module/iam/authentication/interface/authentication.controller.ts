import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { RefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { SignInWithTransactionDto } from '@iam/authentication/application/dto/sign-in-with-transaction.dto';
import { TransactionChallengeResponseDto } from '@iam/authentication/application/dto/transaction-challenge-response.dto';
import { AuthenticationService } from '@iam/authentication/application/service/authentication.service';
import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';

@Controller('auth')
@ApiTags('auth')
@Auth(AuthType.None)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async handleSignIn(
    @Body() signInWithTransactionDto: SignInWithTransactionDto,
  ): Promise<OneSerializedResponseDto<ISignInResponse>> {
    return this.authenticationService.handleSignIn(signInWithTransactionDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async handleRefreshSession(
    @Body() refreshSessionDto: RefreshSessionDto,
  ): Promise<OneSerializedResponseDto<IRefreshSessionResponse>> {
    return this.authenticationService.handleRefreshSession(refreshSessionDto);
  }

  @Get('/challenge')
  async getTransactionChallenge(
    @Query('publicKey') publicKey: string,
  ): Promise<OneSerializedResponseDto<TransactionChallengeResponseDto>> {
    return await this.authenticationService.getTransactionChallenge(publicKey);
  }
}
