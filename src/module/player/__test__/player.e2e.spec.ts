import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { IPlayerDto } from '@module/player/application/dto/player.dto.interface';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TransactionBuilder, scValToNative } from '@stellar/stellar-sdk';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { UnknownErrorException } from '@common/infrastructure/exception/unknow-error.exception';
import {
  InvalidStellarTransactionError,
  StellarAccountNotFound,
} from '@common/infrastructure/stellar/exception/stellar.exception';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import {
  getTransactionResponse,
  loadAccountUseCases,
  transactionUseCases,
} from '@test/test-stellar.setup';
import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

const { ERROR_ACCOUNT, PK_ERROR } = loadAccountUseCases;
const { MINT_PLAYER } = getTransactionResponse;
const { name, metadataUri, externalId, issuer } = MINT_PLAYER.returnValue;
const { ERROR } = transactionUseCases;

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

  describe('GET - /player', () => {
    it('Should return paginated players.', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/player')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = {
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  createdAt: expect.any(String),
                  deletedAt: null,
                  description: expect.any(String),
                  imageUri: expect.any(String),
                  isInAuction: expect.any(Boolean),
                  issuer: expect.any(String),
                  metadataUri: expect.any(String),
                  name: expect.any(String),
                  updatedAt: expect.any(String),
                  uuid: expect.any(String),
                }),
                id: expect.any(String),
                type: 'player',
              }),
            ]),
            meta: expect.objectContaining({
              pageNumber: expect.any(Number),
              pageSize: expect.any(Number),
              itemCount: expect.any(Number),
              pageCount: expect.any(Number),
            }),
            included: expect.any(Array),
            links: expect.objectContaining({
              self: expect.any(String),
              last: expect.any(String),
              next: null,
            }),
          };

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should allow to filter by attributes', async () => {
      const name = 'player';

      await request(app.getHttpServer())
        .get(`/api/v1/player?filter[name]=${name}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = {
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  name: expect.any(String),
                }),
              }),
            ]),
            meta: expect.objectContaining({
              pageNumber: expect.any(Number),
              pageSize: expect.any(Number),
              itemCount: expect.any(Number),
              pageCount: expect.any(Number),
            }),
            included: expect.any(Array),
            links: expect.objectContaining({
              self: expect.any(String),
              last: expect.any(String),
              next: null,
            }),
          };

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should allow to sort by attributes', async () => {
      const firstPlayer = { name: '' } as PlayerResponseDto;
      const lastPlayer = { name: '' } as PlayerResponseDto;
      let pageCount: number;

      await request(app.getHttpServer())
        .get('/api/v1/player?sort[name]=DESC')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          firstPlayer.name = body.data[0].attributes.name;
          pageCount = body.meta.pageCount;
          firstPlayer.name = body.data[0].attributes.name;
          pageCount = body.meta.pageCount;
        });

      await request(app.getHttpServer())
        .get(`/api/v1/player?sort[name]=ASC&page[number]=${pageCount}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resources = body.data;
          lastPlayer.name = resources[resources.length - 1].attributes.name;
          expect(lastPlayer.name).toBe(firstPlayer.name);
        });
    });

    it('Should allow to select specific attributes', async () => {
      const attributes = ['name', 'description'] as (keyof PlayerResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/player?fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resourceAttributes = body.data[0].attributes;
          expect(resourceAttributes).toEqual({
            name: expect.any(String),
            description: expect.any(String),
            imageUri: expect.any(String),
            metadataUri: expect.any(String),
          });
        });
    });

    it('Should allow to include related resources', async () => {
      const include = ['owner'] as (keyof PlayerResponseDto)[];
      await request(app.getHttpServer())
        .get(`/api/v1/player?include[target]=${include.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const player = body.data[0];
          expect(player.relationships).toEqual({
            owner: expect.objectContaining({
              data: expect.objectContaining({
                id: expect.any(String),
                type: 'owner',
              }),
              links: expect.objectContaining({
                self: expect.any(String),
                related: expect.any(String),
              }),
            }),
          });
        });
    });
  });

  describe('GET - /player/:id', () => {
    it('Should return the XDR of the mintPlayer transaction.', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/player/1')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                createdAt: expect.any(String),
                description: expect.any(String),
                issuer: expect.any(String),
                metadataUri: expect.any(String),
                imageUri: expect.any(String),
                name: expect.any(String),
                updatedAt: expect.any(String),
                uuid: expect.any(String),
              }),
              id: expect.any(String),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('POST - /player', () => {
    const createPlayerDto = {
      name,
      description: 'description',
    } as IPlayerDto;
    it('Should return the XDR of the mintPlayer transaction.', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/player/mint')
        .auth(adminToken, { type: 'bearer' })
        .field('name', createPlayerDto.name)
        .field('description', createPlayerDto.description)
        .attach('file', `${__dirname}/fixture/nft.jpeg`)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                xdr: expect.any(String),
                imageCid: expect.any(String),
                metadataCid: expect.any(String),
                issuer: expect.any(String),
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
      TransactionBuilder.fromXDR = jest.fn().mockReturnValue('xdr');
      (scValToNative as jest.Mock).mockReturnValue({
        id: externalId,
        name,
        issuer,
        metadata_uri: metadataUri,
      });

      await request(app.getHttpServer())
        .post('/api/v1/player/submit/mint')
        .auth(adminToken, { type: 'bearer' })
        .send({
          xdr: 'xdr',
          imageCid: 'imageCid',
          metadataCid: 'metadataCid',
          issuer,
          name: 'name',
          description: 'description',
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                uuid: expect.any(String),
                name: expect.any(String),
                metadataUri: expect.any(String),
                imageUri: expect.any(String),
                description: expect.any(String),
                issuer: expect.any(String),
              }),
            }),
          });
          expect(expectedResponse).toEqual(body);
        });
    });

    it('Should return an error message stating that the Stellar account was not found', async () => {
      const publicKey = PK_ERROR;

      const adminToken = createAccessToken({
        publicKey,
        sub: '00000000-0000-0000-0000-0000000000XX',
      });

      await request(app.getHttpServer())
        .post('/api/v1/player/mint')
        .auth(adminToken, { type: 'bearer' })
        .field('name', createPlayerDto.name)
        .field('description', createPlayerDto.description)
        .attach('file', `${__dirname}/fixture/nft.jpeg`)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new StellarAccountNotFound(publicKey).message,
          );
        });
    });

    it('Should return an error indicating that there was a failure in the transaction.', async () => {
      const publicKey = ERROR_ACCOUNT;
      const adminToken = createAccessToken({
        publicKey,
        sub: '00000000-0000-0000-0000-000000000XXX',
      });
      await request(app.getHttpServer())
        .post('/api/v1/player/mint')
        .auth(adminToken, { type: 'bearer' })
        .field('name', createPlayerDto.name)
        .field('description', createPlayerDto.description)
        .attach('file', `${__dirname}/fixture/nft.jpeg`)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new InvalidStellarTransactionError().message,
          );
        });
    });

    it('Should return an error if the transaction submission to the Stellar network fails.', async () => {
      const publicKey = PK_ERROR;
      const adminToken = createAccessToken({
        publicKey,
        sub: '00000000-0000-0000-0000-0000000000XX',
      });
      TransactionBuilder.fromXDR = jest.fn().mockReturnValue(ERROR);

      await request(app.getHttpServer())
        .post('/api/v1/player/submit/mint')
        .auth(adminToken, { type: 'bearer' })
        .send({
          xdr: ERROR,
          metadataCid: 'metadataCid',
          imageCid: 'imageCid',
          issuer,
          name,
          description: 'description',
        })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new UnknownErrorException({
              message: 'Failed to submit transaction to Soroban',
            }).message,
          );
        });
    });
  });
});
