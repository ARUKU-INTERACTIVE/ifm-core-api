import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthenticationResponseAdapter } from '@iam/authentication/application/adapter/authentication-response.adapter';
import { AuthenticationService } from '@iam/authentication/application/service/authentication.service';
import { AccessTokenGuard } from '@iam/authentication/infrastructure/guard/access-token.guard';
import { AuthenticationGuard } from '@iam/authentication/infrastructure/guard/authentication.guard';
import { JwtStrategy } from '@iam/authentication/infrastructure/passport/jwt.strategy';
import { AuthenticationController } from '@iam/authentication/interface/authentication.controller';
import { UserModule } from '@iam/user/user.module';

import { StellarModule } from '../../stellar/stellar.module';
import { EmailDomainMiddleware } from './infrastructure/middleware/email-domain.middleware';

@Module({
  imports: [
    PassportModule,
    UserModule,
    StellarModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    JwtStrategy,
    AccessTokenGuard,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    AuthenticationResponseAdapter,
    AuthenticationController,
    AuthenticationService,
  ],
})
export class AuthenticationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EmailDomainMiddleware).forRoutes({
      path: '**/auth/sign-up',
      method: RequestMethod.POST,
    });
  }
}
