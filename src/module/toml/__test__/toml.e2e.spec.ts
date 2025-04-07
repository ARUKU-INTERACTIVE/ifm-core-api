import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';

describe('Toml Module', () => {
  let app: INestApplication;

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

  describe('GET - /.well-known', () => {
    it('Should return a .txt file with the created NFTs', async () => {
      await request(app.getHttpServer())
        .get('/.well-known/stellar.toml')
        .expect(HttpStatus.OK)
        .then(({ headers }) => {
          expect(headers['content-type']).toEqual('text/plain; charset=utf-8');
        });
    });
  });
});
