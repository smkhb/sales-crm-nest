import { AppModule } from '@/infra/app.module';
import { DbModule } from '@/infra/db/db.module';
import { PrismaService } from '@/infra/db/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientFactoryE2E } from 'tests/factories/make-client-e2e';
import { SalespersonFactoryE2E } from 'tests/factories/make-salesperson-e2e';
import request from 'supertest';
import { Test } from '@nestjs/testing';

describe('Register client E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let salespersonFactory: SalespersonFactoryE2E;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DbModule],
      providers: [SalespersonFactoryE2E],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);
    salespersonFactory = moduleRef.get(SalespersonFactoryE2E);

    await app.init();
  });

  test('should register a new client', async () => {
    const manager = await salespersonFactory.makePrismaSalesperson({
      role: 'manager',
    });

    const accessToken = jwt.sign({
      sub: manager.id,
      role: manager.role,
    });

    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Acme Corporation',
        email: 'acme@example.com',
        phone: '9876543210',
        segment: 'Technology',
      });

    expect(response.status).toBe(201);

    const clientOnDatabase = await prisma.client.findUnique({
      where: { email: 'acme@example.com' },
    });

    expect(clientOnDatabase).toBeTruthy();
  });
});
