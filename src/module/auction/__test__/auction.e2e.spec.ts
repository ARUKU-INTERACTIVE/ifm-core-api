import { AuctionStatus } from '@module/auction/application/enum/auction-status.enum';
import { Auction } from '@module/auction/domain/auction.domain';
import { PlayerNotOwnedByUserException } from '@module/player/infrastructure/database/exception/player.exception';
import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { TransactionBuilder, scValToNative } from '@stellar/stellar-sdk';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import {
  getTransactionResponse,
  transactionUseCases,
} from '@test/test-stellar.setup';
import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

const { MINT_PLAYER } = getTransactionResponse;
const { externalId } = MINT_PLAYER.returnValue;
const { ERROR } = transactionUseCases;

describe('Auction Module', () => {
  let app: INestApplication;

  (scValToNative as jest.Mock).mockReturnValue({
    end_time: 1744266314n,
    highest_bid_amount: 300n,
    highest_bidder_address: null,
    id: 1n,
    owner_address: 'GDBTYMYAM7MUQZKKLHVWZWJLNUXKNZBAITUJY6ES7RYZ5VSD72LP3YPL',
    player_address: 'CCX7BU3F5E2G3CZE2HTXT46PSWNSRNUR5HA4AKKGPG5V6ZORWFXU7IGH',
    start_time: 1744266014n,
    status: ['Open'],
  });

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

  describe('GET - /auction', () => {
    it('Should return paginated players.', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auction')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = {
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  externalId: expect.any(Number),
                  status: expect.any(String),
                  highestBidAmount: expect.any(Number),
                  highestBidderAddress: null,
                  playerAddress: expect.any(String),
                  updatedAt: expect.any(String),
                  uuid: expect.any(String),
                  endTime: expect.any(Number),
                  startTime: expect.any(Number),
                  createdAt: expect.any(String),
                  deletedAt: null,
                }),
                id: expect.any(String),
                type: 'auction',
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
      const status = AuctionStatus.Open;

      await request(app.getHttpServer())
        .get(`/api/v1/auction?filter[status]=${status}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = {
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  status: expect.any(String),
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
      const firstPlayer = { status: AuctionStatus.Open };
      const lastPlayer = { status: AuctionStatus.Open };
      let pageCount: number;

      await request(app.getHttpServer())
        .get('/api/v1/auction?sort[status]=DESC')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          firstPlayer.status = body.data[0].attributes.status;
          pageCount = body.meta.pageCount;
        });

      await request(app.getHttpServer())
        .get(`/api/v1/auction?sort[status]=ASC&page[number]=${pageCount}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resources = body.data;
          lastPlayer.status = resources[resources.length - 1].attributes.status;
          expect(lastPlayer.status).toBe(firstPlayer.status);
        });
    });

    it('Should allow to select specific attributes', async () => {
      const attributes = ['externalId', 'status'] as (keyof Auction)[];

      await request(app.getHttpServer())
        .get(`/api/v1/auction?fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resourceAttributes = body.data[0].attributes;
          expect(resourceAttributes).toEqual(
            expect.objectContaining({
              externalId: expect.any(Number),
              status: expect.any(String),
            }),
          );
        });
    });

    it('Should allow to include related resources', async () => {
      const include = ['player'] as (keyof Auction)[];
      await request(app.getHttpServer())
        .get(`/api/v1/auction?include[target]=${include.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const auction = body.data[0];
          expect(auction.relationships).toEqual({
            player: expect.objectContaining({
              data: expect.objectContaining({
                id: expect.any(String),
                type: 'player',
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

  describe('GET - /auction/:id', () => {
    it('should return the auction being searched for', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auction/1')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                uuid: expect.any(String),
                externalId: expect.any(Number),
                status: expect.any(String),
                highestBidAmount: expect.any(Number),
                highestBidderAddress: null,
                playerAddress: expect.any(String),
                endTime: expect.any(Number),
                startTime: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deletedAt: null,
              }),
              id: expect.any(String),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should return an error message if the auction does not exist', async () => {
      const auctionId = 10000000;
      await request(app.getHttpServer())
        .get(`/api/v1/auction/${auctionId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new NotFoundException(`Auction with id ${auctionId} not found`)
              .message,
          );
        });
    });
  });

  describe('POST - /auction/create/transaction', () => {
    it('Should return the XDR of the createAuction transaction', async () => {
      TransactionBuilder.fromXDR = jest.fn().mockReturnValue({
        sign: jest.fn(),
        toXDR: jest.fn().mockReturnValue('xdr'),
      });
      await request(app.getHttpServer())
        .post('/api/v1/auction/create/transaction')
        .auth(adminToken, { type: 'bearer' })
        .send({
          playerId: 1,
          startingPrice: 100,
          auctionTimeMs: 100,
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                xdr: expect.any(String),
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should return an error message and status code 403 if the user is not the owner of the player', async () => {
      TransactionBuilder.fromXDR = jest.fn().mockReturnValue({
        sign: jest.fn(),
        toXDR: jest.fn().mockReturnValue('xdr'),
      });

      const user = createAccessToken({
        publicKey: 'PK-USER',
        sub: '00000000-0000-0000-0000-000000000PKX',
      });
      await request(app.getHttpServer())
        .post('/api/v1/auction/create/transaction')
        .auth(user, { type: 'bearer' })
        .send({
          playerId: 1,
          startingPrice: 100,
          auctionTimeMs: 100,
        })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new PlayerNotOwnedByUserException().message,
          );
        });
    });
  });

  describe('POST - /auction/submit/transaction', () => {
    it('should return the auction created in Soroban', async () => {
      const playerId = 1;

      TransactionBuilder.fromXDR = jest.fn().mockReturnValue({
        sign: jest.fn(),
        toXDR: jest.fn().mockReturnValue('xdr'),
      });

      await request(app.getHttpServer())
        .post('/api/v1/auction/submit/transaction')
        .auth(adminToken, { type: 'bearer' })
        .send({ playerId, xdr: 'xdr' })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                uuid: expect.any(String),
                externalId: expect.any(Number),
                status: expect.any(String),
                highestBidAmount: expect.any(Number),
                highestBidderAddress: null,
                playerAddress: expect.any(String),
                endTime: expect.any(Number),
                startTime: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deletedAt: null,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should return an error message if the transaction could not be submitted to the Soroban network', async () => {
      const playerId = 1;

      TransactionBuilder.fromXDR = jest.fn().mockReturnValue(ERROR);
      (scValToNative as jest.Mock).mockReturnValue({
        id: externalId,
      });

      await request(app.getHttpServer())
        .post('/api/v1/auction/submit/transaction')
        .auth(adminToken, { type: 'bearer' })
        .send({ playerId, xdr: 'xdr' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            'Failed to submit transaction to Soroban',
          );
        });
    });
  });
});
