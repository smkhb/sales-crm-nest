import { SalespersonFactoryE2E } from 'tests/factories/make-salesperson-e2e';
import { INestApplication } from '@nestjs/common';
import { HashGenerator } from '@/main/crm/app/cryptography/hash-generator';
import { BcryptHasher } from '@/infra/crypt/bcrypt-hasher';
import { AppModule } from '@/infra/app.module';
import { DbModule } from '@/infra/db/db.module';
import { Test } from '@nestjs/testing';

import request from 'supertest';

describe('Authenticate salesperson E2E', () => {
  let app: INestApplication;
  let hashGenerator: HashGenerator;
  let salespersonFactory: SalespersonFactoryE2E;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DbModule],
      providers: [
        SalespersonFactoryE2E,
        {
          provide: HashGenerator,
          useClass: BcryptHasher,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    hashGenerator = moduleRef.get(HashGenerator);
    salespersonFactory = moduleRef.get(SalespersonFactoryE2E);

    await app.init();
  });

  test('[POST]/auth - a salesperson should be able to authenticate', async () => {
    const hashedPassword = await hashGenerator.hash('securepassword');

    const salesperson = await salespersonFactory.makePrismaSalesperson({
      password: hashedPassword,
    });

    const response = await request(app.getHttpServer()).post('/auth').send({
      email: salesperson.email,
      password: 'securepassword',
    });

    expect(response.status).toBe(201);
  });
});
