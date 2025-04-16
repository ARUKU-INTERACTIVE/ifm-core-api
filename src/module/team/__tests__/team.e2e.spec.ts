import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CreateDto } from '@/module/team/application/dto/create-team.dto';
import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';
import { UpdateDto } from '@/module/team/application/dto/update-team.dto';
import { TEAM_ENTITY_NAME } from '@/module/team/domain/team.name';

describe.skip('Team Module', () => {
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

  describe('GET - /team', () => {
    it('should return paginated teams', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/team')
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
                type: TEAM_ENTITY_NAME,
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
      const attributes = ['name'] as (keyof TeamResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/team?fields[target]=${attributes.join(',')}`)
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
        .get(`/api/v1/team?filter[name]=${name}`)
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

  describe('GET - /team/:id', () => {
    it('should return a specific team', async () => {
      const teamId = 1;

      await request(app.getHttpServer())
        .get(`/api/v1/team/${teamId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: teamId.toString(),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if team is not found', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/team/9999')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe('Team with ID 9999 not found');
        });
    });
  });

  describe('POST - /team', () => {
    it('should create a new team', async () => {
      const createTeamDto = { name: 'Mary' } as CreateDto;

      await request(app.getHttpServer())
        .post('/api/v1/team/')
        .auth(adminToken, { type: 'bearer' })
        .send(createTeamDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                name: createTeamDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /team/:id', () => {
    it('should update an existing team', async () => {
      const createTeamDto = { name: 'Mary' } as CreateDto;
      const updateTeamDto = { name: 'Jane' } as UpdateDto;
      let teamId: number;

      await request(app.getHttpServer())
        .post('/api/v1/team')
        .auth(adminToken, { type: 'bearer' })
        .send(createTeamDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createTeamDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          teamId = body.data.id;
        });

      await request(app.getHttpServer())
        .patch(`/api/v1/team/${teamId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateTeamDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: teamId.toString(),
              attributes: expect.objectContaining({
                name: updateTeamDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if team is not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/team/9999')
        .send({ name: 'non-existing-team' } as UpdateDto)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe('Team with ID 9999 not found');
        });
    });
  });

  describe('DELETE - /team/:id', () => {
    it('should delete a team', async () => {
      const createTeamDto = { name: 'Mary' } as CreateDto;
      let teamId: number;

      await request(app.getHttpServer())
        .post('/api/v1/team')
        .auth(adminToken, { type: 'bearer' })
        .send(createTeamDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createTeamDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          teamId = body.data.id;
        });

      await request(app.getHttpServer())
        .delete(`/api/v1/team/${teamId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get(`/api/v1/team/${teamId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
