import { UpdateFormationDto } from '@module/formation/application/dto/update-formation.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CreateFormationDto } from '@/module/formation/application/dto/create-formation.dto';
import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';
import { Position } from '@/module/formation/application/enum/formation-position.enum';
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
                  forwards: expect.any(Number),
                  midfielders: expect.any(Number),
                  defenders: expect.any(Number),
                  isActive: expect.any(Boolean),
                  uuid: expect.stringMatching(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
                  ),
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
      const attributes = [
        'name',
        'forwards',
        'midfielders',
        'defenders',
      ] as (keyof FormationResponseDto)[];

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
            forwards: expect.any(Number),
            midfielders: expect.any(Number),
            defenders: expect.any(Number),
          });
        });
    });

    it('should allow to filter by attributes', async () => {
      const name = '4-4-2';

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
                  forwards: 2,
                  midfielders: 4,
                  defenders: 4,
                }),
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should allow to sort by attributes', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/formation?sort[name]=asc')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.length).toBeGreaterThan(0);
          const names = body.data.map((item) => item.attributes.name);
          const sortedNames = [...names].sort();
          expect(names).toEqual(sortedNames);
        });
    });
  });

  describe('GET - /formation/:id', () => {
    it('should return a specific formation', async () => {
      const formationId = '3c848713-18df-4c04-b445-46e55df00029';

      await request(app.getHttpServer())
        .get(`/api/v1/formation/${formationId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              type: 'formation',
              attributes: expect.objectContaining({
                uuid: '3c848713-18df-4c04-b445-46e55df00029',
                name: '4-4-2',
                forwards: 2,
                midfielders: 4,
                defenders: 4,
                createdAt: '2025-04-25T16:42:10.000Z',
                updatedAt: '2025-04-25T16:42:10.000Z',
                deletedAt: null,
                isActive: expect.any(Boolean),
              }),
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
          expect(body.error.detail).toBe('Formation with UUID 9999 not found');
        });
    });
  });

  describe('POST - /formation', () => {
    it('should create a new formation', async () => {
      const createFormationDto = {
        name: '5-3-2',
        description: 'Formación defensiva con dos delanteros',
        forwards: 2,
        midfielders: 3,
        defenders: 5,
        rosterUuid: '00000000-0000-0000-0000-000000000001',
        formationPlayers: [
          {
            playerUuid: '00000000-0000-0000-0000-000000000001',
            position: Position.Forward,
            positionIndex: 0,
          },
        ],
      } as CreateFormationDto;

      await request(app.getHttpServer())
        .post('/api/v1/formation/')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                uuid: expect.any(String),
                name: '5-3-2',
                forwards: 2,
                midfielders: 3,
                defenders: 5,
                formationPlayers: expect.arrayContaining([]),
                isActive: expect.any(Boolean),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                deletedAt: null,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /formation', () => {
    it('should update an existing formation', async () => {
      const createFormationDto = {
        name: '4-2-3-1',
        description: 'Formación con un delantero centro',
        forwards: 1,
        midfielders: 5,
        defenders: 4,
        rosterUuid: '00000000-0000-0000-0000-000000000001',
        formationPlayers: [
          {
            playerUuid: '00000000-0000-0000-0000-000000000001',
            position: Position.Forward,
            positionIndex: 0,
          },
        ],
      } as CreateFormationDto;

      let formationUuid: string;

      await request(app.getHttpServer())
        .post('/api/v1/formation')
        .auth(adminToken, { type: 'bearer' })
        .send(createFormationDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          formationUuid = body.data.attributes.uuid;
        });

      const updateFormationDto = {
        formationUuid,
        name: '4-2-3-1',
        description: 'Formación modificada con un delantero centro',
        forwards: 1,
        midfielders: 5,
        defenders: 4,
        formationPlayers: [
          {
            formationPlayerUuid: '00000000-0000-0000-0000-000000000001',
            position: Position.Forward,
            positionIndex: 0,
          },
        ],
        newFormationPlayers: [
          {
            playerUuid: '00000000-0000-0000-0000-000000000002',
            position: Position.Forward,
            positionIndex: 1,
          },
        ],
      } as UpdateFormationDto;

      await request(app.getHttpServer())
        .patch('/api/v1/formation')
        .auth(adminToken, { type: 'bearer' })
        .send(updateFormationDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                name: updateFormationDto.name,
                forwards: updateFormationDto.forwards,
                midfielders: updateFormationDto.midfielders,
                defenders: updateFormationDto.defenders,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if formation is not found', async () => {
      const updateFormationDto = {
        formationUuid: '00000000-0000-0000-0000-000000000999',
        name: 'non-existing-formation',
        description: 'Non-existing formation',
        forwards: 3,
        midfielders: 4,
        defenders: 3,
        formationPlayers: [],
        newFormationPlayers: [],
      } as UpdateFormationDto;

      await request(app.getHttpServer())
        .patch('/api/v1/formation')
        .send(updateFormationDto)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe(
            'Formation with UUID 00000000-0000-0000-0000-000000000999 not found',
          );
        });
    });
  });
});
