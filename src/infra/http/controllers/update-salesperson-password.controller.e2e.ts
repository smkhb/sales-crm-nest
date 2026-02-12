import { AppModule } from '@/infra/app.module';
import { DbModule } from '@/infra/db/db.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { SalespersonFactoryE2E } from 'tests/factories/make-salesperson-e2e';
import request from 'supertest';

describe('Update salesperson password E2E', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let salespersonFactory: SalespersonFactoryE2E;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DbModule],
      providers: [SalespersonFactoryE2E],
    }).compile();

    app = moduleRef.createNestApplication();
    jwt = moduleRef.get(JwtService);
    salespersonFactory = moduleRef.get(SalespersonFactoryE2E);

    await app.init();
  });

  test('[PATCH]/salespersons/password/:id - a manager should be able to update a salesperson password', async () => {
    const manager = await salespersonFactory.makePrismaSalesperson({
      role: 'manager',
    });

    const salesperson = await salespersonFactory.makePrismaSalesperson();

    const accessToken = jwt.sign({
      sub: manager.id,
      role: manager.role,
    });

    const response = await request(app.getHttpServer())
      .patch(`/salespersons/password/${salesperson.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        newPassword: 'newpassword',
      });

    expect(response.status).toBe(200);
  });
});
