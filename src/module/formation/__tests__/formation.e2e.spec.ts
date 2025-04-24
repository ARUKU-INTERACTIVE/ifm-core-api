import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CreateFormationDto } from '@/module/formation/application/dto/create-formation.dto';
import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';
import { UpdateDto } from '@/module/formation/application/dto/update-formation.dto';
import { FORMATION_ENTITY_NAME } from '@/module/formation/domain/formation.name';

describe('Formation Module', () => {
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

  describe('GET - /formation', () => {
    it('should return paginated formations', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/formation')
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
                type: FORMATION_ENTITY_NAME,
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
      const attributes = ['name'] as (keyof FormationResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/formation?fields[target]=${attributes.join(',')}`)
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
        .get(`/api/v1/formation?filter[name]=${name}`)
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

  describe('GET - /formation/:id', () => {
    it('should return a specific formation', async () => {
      const formationId = 1;

      await request(app.getHttpServer())
        .get(`/api/v1/formation/${formationId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: formationId.toString(),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if formation is not found', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/formation/9999')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe('Formation with ID 9999 not found');
        });
    });
  });

  describe('POST - /formation', () => {
    it('should create a new formation', async () => {
      const createFormationDto = { name: 'Mary' } as CreateFormationDto;

      await request(app.getHttpServer())
        .post('/api/v1/formation/')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                name: createFormationDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /formation/:id', () => {
    it('should update an existing formation', async () => {
      const createFormationDto = { name: 'Mary' } as CreateFormationDto;
      const updateFormationDto = { name: 'Jane' } as UpdateDto;
      let formationId: number;

      await request(app.getHttpServer())
        .post('/api/v1/formation')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createFormationDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          formationId = body.data.id;
        });

      await request(app.getHttpServer())
        .patch(`/api/v1/formation/${formationId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateFormationDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: formationId.toString(),
              attributes: expect.objectContaining({
                name: updateFormationDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if formation is not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/formation/9999')
        .send({ name: 'non-existing-formation' } as UpdateDto)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe('Formation with ID 9999 not found');
        });
    });
  });

  describe('DELETE - /formation/:id', () => {
    it('should delete a formation', async () => {
      const createFormationDto = { name: 'Mary' } as CreateFormationDto;
      let formationId: number;

      await request(app.getHttpServer())
        .post('/api/v1/formation')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createFormationDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          formationId = body.data.id;
        });

      await request(app.getHttpServer())
        .delete(`/api/v1/formation/${formationId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get(`/api/v1/formation/${formationId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
