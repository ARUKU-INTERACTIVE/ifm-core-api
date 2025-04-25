import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ENVIRONMENT } from '@config/environment.enum';

import { IAccessTokenPayload } from '@iam/authentication/infrastructure/passport/access-token-payload.interface';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';

import { JWT_AUTOMATED_TESTS_SECRET } from '@test/test.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
  ) {
    /* istanbul ignore next */
    const options =
      process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS
        ? {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_AUTOMATED_TESTS_SECRET,
          }
        : {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
          };

    super(options);
  }

  async validate(accessTokenPayload: IAccessTokenPayload): Promise<User> {
    let currentUser: User;
    currentUser = await this.userRepository.getOneByPublicKey(
      accessTokenPayload.publicKey,
    );
    if (!currentUser) {
      currentUser = await this.userRepository.getOneByExternalId(
        accessTokenPayload.sub,
      );
    }
    if (!currentUser) {
      throw new ForbiddenException();
    }
    return currentUser;
  }
}
