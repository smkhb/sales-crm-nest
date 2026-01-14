import { AppModule } from '@/infra/app.module';
import { DbModule } from '@/infra/db/db.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { SalespersonFactoryE2E } from 'tests/factories/make-salesperson-e2e';
import request from 'supertest';

describe('Get salesperson details E2E', () => {
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

  test('[GET]/salespersons - a manager should be able to fetch salespersons', async () => {
    const manager = await salespersonFactory.makePrismaSalesperson({
      name: 'Manager User',
      role: 'manager',
    });

    for (let i = 1; i <= 5; i++) {
      await salespersonFactory.makePrismaSalesperson({
        name: `Salesperson ${i}`,
      });
    }

    const accessToken = jwt.sign({
      sub: manager.id,
      role: manager.role,
    });

    const response = await request(app.getHttpServer())
      .get(`/salespersons`)
      .query({ page: 1 })
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.salespersons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Manager User' }),
        expect.objectContaining({ name: 'Salesperson 1' }),
        expect.objectContaining({ name: 'Salesperson 2' }),
        expect.objectContaining({ name: 'Salesperson 3' }),
        expect.objectContaining({ name: 'Salesperson 4' }),
        expect.objectContaining({ name: 'Salesperson 5' }),
      ]),
    );
  });
});
