import { ICreatePlayerDto } from '@module/player/application/dto/create-player.dto.interface';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import {
  InvalidStellarTransactionError,
  StellarAccountNotFound,
  StellarTransactionSubmissionError,
} from '@common/infrastructure/stellar/exception/stellar.exception';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Player Module', () => {
  let app: INestApplication;

  const adminToken = createAccessToken({
    publicKey: 'GXXX-XXXX-XXXX-XXXX1',
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  beforeAll(async () => {
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication({ logger: false });

    setupApp(app);

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST - /player', () => {
    const createPlayerDto = {
      name: 'Jonh Doe',
      metadataUri: 'http://example.com',
    } as ICreatePlayerDto;
    it('Should return the XDR of the mintPlayer transaction.', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/player/mint')
        .auth(adminToken, { type: 'bearer' })
        .send(createPlayerDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          console.log(body, 'body');
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                xdr: expect.any(String),
              }),
            }),
          });
          expect(expectedResponse).toEqual(body);
        });

      await request(app.getHttpServer())
        .post('/api/v1/player/submit/mint')
        .auth(adminToken, { type: 'bearer' })
        .send({ xdr: 'xdr' })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                externalId: expect.any(Number),
                uuid: expect.any(String),
                name: expect.any(String),
                metadataUri: expect.any(String),
                issuer: expect.any(String),
              }),
            }),
          });
          expect(expectedResponse).toEqual(body);
        });
    });

    it('Should return an error message stating that the Stellar account was not found', async () => {
      const publicKey = 'ERROR';
      const adminToken = createAccessToken({
        publicKey,
        sub: '00000000-0000-0000-0000-0000000000XX',
      });

      await request(app.getHttpServer())
        .post('/api/v1/player/mint')
        .auth(adminToken, { type: 'bearer' })
        .send(createPlayerDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new StellarAccountNotFound(publicKey).message,
          );
        });
    });

    it('Should return an error indicating that there was a failure in the transaction.', async () => {
      const publicKey = 'ERROR-ACCOUNT';
      const adminToken = createAccessToken({
        publicKey,
        sub: '00000000-0000-0000-0000-000000000XXX',
      });
      await request(app.getHttpServer())
        .post('/api/v1/player/mint')
        .auth(adminToken, { type: 'bearer' })
        .send(createPlayerDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new InvalidStellarTransactionError().message,
          );
        });
    });

    it('Should return an error if the transaction submission to the Stellar network fails.', async () => {
      const publicKey = 'ERROR';
      const adminToken = createAccessToken({
        publicKey,
        sub: '00000000-0000-0000-0000-0000000000XX',
      });

      await request(app.getHttpServer())
        .post('/api/v1/player/submit/mint')
        .auth(adminToken, { type: 'bearer' })
        .send({ xdr: 'ERROR' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new StellarTransactionSubmissionError().message,
          );
        });
    });
  });
});
