import { AppModule } from '@/infra/app.module';
import { DbModule } from '@/infra/db/db.module';
import { PrismaService } from '@/infra/db/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { SalespersonFactoryE2E } from 'tests/factories/make-salesperson-e2e';
import request from 'supertest';

describe('Update salesperson E2E', () => {
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

  test('[PATCH]/salespersons/:id - a manager should be able to update a salesperson', async () => {
    const manager = await salespersonFactory.makePrismaSalesperson({
      role: 'manager',
    });

    const salesperson = await salespersonFactory.makePrismaSalesperson();

    const accessToken = jwt.sign({
      sub: manager.id,
      role: manager.role,
    });

    const response = await request(app.getHttpServer())
      .patch(`/salespersons/${salesperson.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Jane Smith',
        phone: '0987654321',
      });

    expect(response.status).toBe(200);

    const updatedSalesperson = await prisma.salesperson.findUnique({
      where: { id: salesperson.id },
    });

    expect(updatedSalesperson?.name).toBe('Jane Smith');
    expect(updatedSalesperson?.phone).toBe('0987654321');
  });
});
