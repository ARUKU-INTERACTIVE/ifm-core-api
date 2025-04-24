import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CreateFormationPlayerDto } from '@/module/formation-player/application/dto/create-formation-player.dto';
import { ResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';
import { UpdateDto } from '@/module/formation-player/application/dto/update-formation-player.dto';
import { FORMATION_PLAYER_ENTITY_NAME } from '@/module/formation-player/domain/formation-player.name';

describe('FormationPlayer Module', () => {
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

  describe('GET - /formation-player', () => {
    it('should return paginated formation-players', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/formation-player')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  name: expect.any(String),
                  uuid:
                    expect.stringMatching(
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
                    ) || expect(undefined),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  deletedAt: null,
                }),
                id: expect.any(String),
                type: FORMATION_PLAYER_ENTITY_NAME,
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
      const attributes = ['name'] as (keyof ResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/formation-player?fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resourceAttributes = body.data[0].attributes;
          expect(Object.keys(resourceAttributes).length).toBe(
            attributes.length,
          );
          expect(resourceAttributes).toEqual({
            name: expect.any(String),
          });
        });
    });
    it('should allow to filter by attributes', async () => {
      const name = 'John';

      await request(app.getHttpServer())
        .get(`/api/v1/formation-player?filter[name]=${name}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  name,
                }),
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('GET - /formation-player/:id', () => {
    it('should return a specific formationPlayer', async () => {
      const formationPlayerId = 1;

      await request(app.getHttpServer())
        .get(`/api/v1/formation-player/${formationPlayerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: formationPlayerId.toString(),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if formationPlayer is not found', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/formation-player/9999')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            'FormationPlayer with ID 9999 not found',
          );
        });
    });
  });

  describe('POST - /formation-player', () => {
    it('should create a new formationPlayer', async () => {
      const createFormationPlayerDto = {
        name: 'Mary',
      } as CreateFormationPlayerDto;

      await request(app.getHttpServer())
        .post('/api/v1/formation-player/')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationPlayerDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                name: createFormationPlayerDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /formation-player/:id', () => {
    it('should update an existing formation-player', async () => {
      const createFormationPlayerDto = {
        name: 'Mary',
      } as CreateFormationPlayerDto;
      const updateFormationPlayerDto = { name: 'Jane' } as UpdateDto;
      let formationPlayerId: number;

      await request(app.getHttpServer())
        .post('/api/v1/formation-player')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationPlayerDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createFormationPlayerDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          formationPlayerId = body.data.id;
        });

      await request(app.getHttpServer())
        .patch(`/api/v1/formation-player/${formationPlayerId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateFormationPlayerDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: formationPlayerId.toString(),
              attributes: expect.objectContaining({
                name: updateFormationPlayerDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if formation-player is not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/formation-player/9999')
        .send({ name: 'non-existing-formationPlayer' } as UpdateDto)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            'FormationPlayer with ID 9999 not found',
          );
        });
    });
  });

  describe('DELETE - /formation-player/:id', () => {
    it('should delete a formation-player', async () => {
      const createFormationPlayerDto = {
        name: 'Mary',
      } as CreateFormationPlayerDto;
      let formationPlayerId: number;

      await request(app.getHttpServer())
        .post('/api/v1/formation-player')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationPlayerDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createFormationPlayerDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          formationPlayerId = body.data.id;
        });

      await request(app.getHttpServer())
        .delete(`/api/v1/formation-player/${formationPlayerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get(`/api/v1/formation-player/${formationPlayerId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
