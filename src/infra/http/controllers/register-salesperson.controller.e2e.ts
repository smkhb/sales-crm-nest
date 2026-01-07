import { AppModule } from '@/infra/app.module';
import { DbModule } from '@/infra/db/db.module';
import { PrismaService } from '@/infra/db/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { SalespersonRole } from '@prisma/client';
import request from 'supertest';
import { SalespersonFactoryE2E } from 'tests/factories/make-salesperson-e2e';

describe('Register salesperson E2E', () => {
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

  test('[POST]/salespersons - a manager should be able to register a new salesperson', async () => {
    const manager = await salespersonFactory.makePrismaSalesperson({
      role: SalespersonRole.manager,
    });

    const accessToken = jwt.sign({
      sub: manager.id,
      role: manager.role,
    });

    const response = await request(app.getHttpServer())
      .post('/salespersons')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'securepassword',
        phone: '1234567890',
      });

    expect(response.status).toBe(201);

    const userOnDatabase = await prisma.salesperson.findUnique({
      where: { email: 'johndoe@example.com' },
    });

    expect(userOnDatabase).toBeTruthy();
  });
});
