import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { UserNotRosterOwnerException } from '@iam/user/infrastructure/database/exception/user-not-roster-owner.exception';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { RosterResponseDto } from '@/module/roster/application/dto/roster-response.dto';
import { ROSTER_ENTITY_NAME } from '@/module/roster/domain/roster.name';

describe('Roster Module', () => {
  let app: INestApplication;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  beforeAll(async () => {
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication({ logger: false });
    setupApp(app);
    await app.init();
  });
  beforeEach(async () => {
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET - /roster', () => {
    it('should return paginated rosters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/roster')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  uuid: expect.any(String) || expect(undefined),
                  teamId: expect.any(Number),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  deletedAt: null,
                }),
                id: expect.any(String),
                type: ROSTER_ENTITY_NAME,
              }),
            ]),
            links: expect.any(Object),
            meta: expect.objectContaining({
              pageNumber: expect.any(Number),
              pageSize: expect.any(Number),
              pageCount: expect.any(Number),
              itemCount: expect.any(Number),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
    it('should allow to select specific attributes', async () => {
      const attributes = ['teamId'] as (keyof RosterResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/roster?fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resourceAttributes = body.data[0].attributes;
          expect(Object.keys(resourceAttributes).length).toBe(
            attributes.length,
          );
          expect(resourceAttributes).toEqual({
            teamId: expect.any(Number),
          });
        });
    });
    it('should allow to filter by attributes', async () => {
      const id = 1;

      await request(app.getHttpServer())
        .get(`/api/v1/roster?filter[id]=${id}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                id: id.toString(),
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('GET - /roster/:uuid', () => {
    it('should return a specific roster', async () => {
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';
      await request(app.getHttpServer())
        .get(`/api/v1/roster/${rosterId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if roster is not found', async () => {
      const rosterId = 'xxxx-xxxx-xxxx-xxxx-9999';
      await request(app.getHttpServer())
        .get(`/api/v1/roster/${rosterId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            `Roster with ID ${rosterId} not found`,
          );
        });
    });
  });

  describe('PATCH - roster/add/roster/:rosterId/player/:playerId', () => {
    it('Should correctly add the player to the roster.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx19';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';
      const user7Token = createAccessToken({
        publicKey: 'GXXX-XXXX-XXXX-XXXX7',
        sub: '00000000-0000-0000-0000-00000XXXXXXX',
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId}`)
        .auth(user7Token, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                rosterId: expect.any(Number),
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should show an error message if the player does not exist.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx999';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';
      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            `Player with ID ${playerId} not found`,
          );
        });
    });

    it('Should show an error message if the user has no team assigned.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';
      const user5Token = createAccessToken({
        publicKey: 'GXXX-XXXX-XXXX-XXXX5',
        sub: '00000000-0000-0000-0000-0000000XXXXX',
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId}`)
        .auth(user5Token, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe('No team assigned to user with ID 6');
        });
    });

    it('Should show an error message if the user does not own the NFT.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.error.detail).toEqual('Player not owned by user');
        });
    });

    it('Should show an error message if the player is already assigned to the roster.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx7';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            `Player with uuid ${playerId} is already assigned to roster uuid ${rosterId}`,
          );
        });
    });

    it('Should show an error message if trying to add a player when the roster already has 11 players.', async () => {
      const playerId6 = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx6';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';
      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId6}`)
        .auth(adminToken, { type: 'bearer' });

      const playerId8 = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx8';
      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId8}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            'The roster already has the maximum of 11 players.',
          );
        });
    });

    it('Should show an error message if the user is not the owner of the roster.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx19';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';
      const user7Token = createAccessToken({
        publicKey: 'GXXX-XXXX-XXXX-XXXX7',
        sub: '00000000-0000-0000-0000-00000XXXXXXX',
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/add/roster/${rosterId}/player/${playerId}`)
        .auth(user7Token, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new UserNotRosterOwnerException().message,
          );
        });
    });
  });

  describe('PATCH - roster/remove/roster/:rosterId/player/:playerId', () => {
    it('Should correctly remove the player to the roster.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx6';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/remove/roster/${rosterId}/player/${playerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                rosterId: null,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should show an error message if the player does not exist.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx999';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';
      await request(app.getHttpServer())
        .patch(`/api/v1/roster/remove/roster/${rosterId}/player/${playerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            `Player with ID ${playerId} not found`,
          );
        });
    });

    it('Should show an error message if the user does not have a roster.', async () => {
      const userId = 7;

      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';

      const user6Token = createAccessToken({
        publicKey: 'GXXX-XXXX-XXXX-XXXX6',
        sub: '00000000-0000-0000-0000-000000XXXXXX',
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/remove/roster/${rosterId}/player/${playerId}`)
        .auth(user6Token, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            `No team assigned to user with ID ${userId}`,
          );
        });
    });

    it('Should display an error message if the user is not the owner of the roster.', async () => {
      const playerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1';
      const rosterId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx3';

      await request(app.getHttpServer())
        .patch(`/api/v1/roster/remove/roster/${rosterId}/player/${playerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.error.detail).toEqual(
            new UserNotRosterOwnerException().message,
          );
        });
    });
  });
});
