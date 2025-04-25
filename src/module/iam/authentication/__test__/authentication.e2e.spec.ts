import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StrKey, TransactionBuilder, WebAuth } from '@stellar/stellar-sdk';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { IRefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto.interface';
import { SignInWithTransactionDto } from '@iam/authentication/application/dto/sign-in-with-transaction.dto';
import {
  INVALID_REFRESH_TOKEN_ERROR,
  TOKEN_EXPIRED_ERROR,
} from '@iam/authentication/application/exception/authentication-exception-messages';
import { InvalidRefreshTokenException } from '@iam/authentication/application/exception/invalid-refresh-token.exception';
import { TokenExpiredException } from '@iam/authentication/application/exception/token-expired.exception';
import { AUTHENTICATION_NAME } from '@iam/authentication/domain/authtentication.name';
import { PublicKeyNotFoundException } from '@iam/user/infrastructure/database/exception/public-key-not-found.exception';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { STELLAR_ERROR } from '../../../stellar/application/exceptions/stellar.error';

describe('Authentication Module', () => {
  let app: INestApplication;
  let jwtServiceMock: JwtService;
  beforeAll(async () => {
    process.env.AUTH_ALLOWED_EMAIL_DOMAINS = 'test.com,example.com,account.com';
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication();
    setupApp(app);

    await app.init();

    jwtServiceMock = moduleRef.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    delete process.env.AUTH_ALLOWED_EMAIL_DOMAINS;
    await app.close();
  });

  describe('Guards', () => {
    describe('Access Token', () => {
      it('should allow requests that contain a valid token', async () => {
        const accessToken = createAccessToken({
          sub: '00000000-0000-0000-0000-00000000000X',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });

      it('should deny requests that contain an invalid token', async () => {
        const accessToken = createAccessToken({
          sub: 'non-existent-user-id',
          publicKey: 'non-existent-publick-key',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });
      it('should respond with an exception if the access token is expired', async () => {
        const expiration = '0ms';
        const accessToken = createAccessToken(
          {
            sub: '00000000-0000-0000-0000-00000000000X',
          },
          { expiresIn: expiration },
        );

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(
              new TokenExpiredException(TOKEN_EXPIRED_ERROR).message,
            );
          });
      });
    });
  });

  describe('API', () => {
    describe('POST - /auth/sign-in', () => {
      it('Should allow users to sign in with transaction data', async () => {
        TransactionBuilder.fromXDR = jest.fn().mockReturnValue({
          memo: {
            value: {
              toString: jest.fn().mockReturnValue('memo'),
            },
          },
        });

        const signInDto: SignInWithTransactionDto = {
          publicKey: 'publicKey',
          transactionSigned: 'transactionSigned',
          memo: 'memo',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: AUTHENTICATION_NAME,
                attributes: expect.objectContaining({
                  accessToken: expect.any(String),
                  refreshToken: expect.any(String),
                }),
              }),
              links: expect.objectContaining({
                self: expect.any(String),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should throw an error if the memo is invalid', async () => {
        const signInDto: SignInWithTransactionDto = {
          publicKey: 'publicKey',
          transactionSigned: 'transactionSigned',
          memo: 'invalidMemo',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.error.detail).toBe(STELLAR_ERROR.INCORRECT_MEMO);
          });
      });

      it('Should throw an error if the signature is invalid', async () => {
        const signInDto: SignInWithTransactionDto = {
          publicKey: 'publicKey',
          transactionSigned: 'invalidTransactionSigned',
          memo: 'memo',
        };
        TransactionBuilder.fromXDR = jest.fn().mockReturnValue({
          memo: {
            value: {
              toString: jest.fn().mockReturnValue('memo'),
            },
          },
        });
        StrKey.isValidEd25519PublicKey = jest.fn().mockReturnValue(false);
        WebAuth.verifyTxSignedBy = jest.fn().mockReturnValue(false);

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.error.detail).toBe(STELLAR_ERROR.INCORRECT_SIGN);
          });
      });
    });

    describe('POST - /auth/refresh', () => {
      const url = '/api/v1/auth/refresh';
      it('Should refresh the session when provided a valid refresh token', async () => {
        jest.spyOn(jwtServiceMock, 'verify').mockReturnValue(() => true);
        const refreshTokenDto: IRefreshSessionDto = {
          refreshToken: 'refreshToken',
          publicKey: 'publicKey1',
        };
        const expectedResponse = expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          }),
        });
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toEqual(expectedResponse);
          });
      });
      it('Should respond with an InvalidRefreshTokenError when provided an invalid refresh token', async () => {
        jest.spyOn(jwtServiceMock, 'verify').mockReturnValue(null);
        const error = new InvalidRefreshTokenException({
          message: INVALID_REFRESH_TOKEN_ERROR,
        });
        const refreshTokenDto: IRefreshSessionDto = {
          refreshToken: 'fakeRefreshToken',
          publicKey: 'publicKey1',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });
      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        const publicKey = 'fakePublicKey';
        const error = new PublicKeyNotFoundException({
          publicKey,
        });
        const refreshTokenDto: IRefreshSessionDto = {
          refreshToken: 'fakeRefreshToken',
          publicKey,
        };
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });
    });

    describe('GET - /auth/challenge', () => {
      it('Should return a transaction challenge', async () => {
        const queryParam = '?publicKey=publicKey';
        StrKey.isValidEd25519PublicKey = jest.fn().mockReturnValue(true);
        return request(app.getHttpServer())
          .get(`/api/v1/auth/challenge${queryParam}`)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: AUTHENTICATION_NAME,
                attributes: expect.objectContaining({
                  transactionXdr: expect.any(String),
                  memo: expect.any(String),
                }),
              }),
              links: expect.objectContaining({
                self: expect.any(String),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should throw an error if the public key is invalid', async () => {
        const queryParam = '?publicKey=invalidPublicKey';
        StrKey.isValidEd25519PublicKey = jest.fn().mockReturnValue(false);

        return request(app.getHttpServer())
          .get(`/api/v1/auth/challenge${queryParam}`)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(STELLAR_ERROR.INVALID_PUBLIC_KEY);
          });
      });
    });
  });
});
