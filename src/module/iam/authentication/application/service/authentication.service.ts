import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

import { AuthenticationResponseAdapter } from '@iam/authentication/application/adapter/authentication-response.adapter';
import { JWTPayloadDto } from '@iam/authentication/application/dto/jwt-payload.dto';
import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { IRefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { SignInWithTransactionDto } from '@iam/authentication/application/dto/sign-in-with-transaction.dto';
import { TransactionChallengeResponseDto } from '@iam/authentication/application/dto/transaction-challenge-response.dto';
import { AUTHENTICATION_NAME } from '@iam/authentication/domain/authtentication.name';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';

import { StellarService } from '../../../../stellar/application/service/stellar.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
    private readonly authenticationResponseAdapter: AuthenticationResponseAdapter,
    private readonly stellarService: StellarService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(publicKey: string): Promise<void> {
    const existingUser = await this.userRepository.getOneByPublicKey(publicKey);

    if (!existingUser) {
      await this.userRepository.saveOne(new User(publicKey));
    }
  }

  async handleSignIn(
    signInWithTransaction: SignInWithTransactionDto,
  ): Promise<OneSerializedResponseDto<ISignInResponse>> {
    const { transactionSigned, publicKey, memo } = signInWithTransaction;

    this.stellarService.verifySignature(publicKey, transactionSigned, memo);

    await this.validateUser(publicKey);

    const tokenResponse = this.signJwt({
      publicKey,
      transactionSigned,
      memo,
    });

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISignInResponse>(
      AUTHENTICATION_NAME,
      tokenResponse,
    );
  }

  private signJwt(payload: JWTPayloadDto) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    return { accessToken, refreshToken };
  }

  async handleRefreshSession(
    refreshSessionDto: IRefreshSessionDto,
  ): Promise<OneSerializedResponseDto<IRefreshSessionResponse>> {
    const { username, refreshToken } = refreshSessionDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    const response = await this.identityProviderService.refreshSession(
      existingUser.username,
      refreshToken,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<IRefreshSessionResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async getTransactionChallenge(
    publicKey: string,
  ): Promise<OneSerializedResponseDto<TransactionChallengeResponseDto>> {
    const transactionChallenge =
      await this.stellarService.getTransactionChallenge(publicKey);

    return this.authenticationResponseAdapter.oneEntityResponseAuth<TransactionChallengeResponseDto>(
      AUTHENTICATION_NAME,
      transactionChallenge,
    );
  }
}
