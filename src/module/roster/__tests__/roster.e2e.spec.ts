import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

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
                  uuid:
                    expect.stringMatching(
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
                    ) || expect(undefined),
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
      const rosterId = 'xxxx-xxxx-xxxx-xxxx-xxx1';

      await request(app.getHttpServer())
        .get(`/api/v1/roster/${rosterId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: rosterId.toString(),
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
});
