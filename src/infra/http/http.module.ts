import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { RegisterSalespersonController } from './controllers/register-salesperson.controller';
import { RegisterSalespersonUseCase } from '@/main/crm/app/cases/register-salesperson';
import { CryptModule } from '../crypt/crypt.module';
import { RegisterClientController } from './controllers/register-client.controller';
import { RegisterClientUseCase } from '@/main/crm/app/cases/register-client';
import { AuthenticateSalespersonUseCase } from '@/main/crm/app/cases/authenticate-salesperson';
import { AuthenticateSalespersonController } from './controllers/authenticate-salesperson.controller';
import { UpdateSalespersonController } from './controllers/update-salesperson.controller';
import { UpdateSalespersonUseCase } from '@/main/crm/app/cases/update-salesperson';
import { GetSalespersonByIDController } from './controllers/get-salesperson-by-id.controller';
import { GetSalespersonByIDUseCase } from '@/main/crm/app/cases/get-salesperson-by-id';

@Module({
  imports: [DbModule, CryptModule],
  controllers: [
    RegisterSalespersonController,
    RegisterClientController,
    AuthenticateSalespersonController,
    UpdateSalespersonController,
    GetSalespersonByIDController,
  ],
  providers: [
    RegisterSalespersonUseCase,
    RegisterClientUseCase,
    AuthenticateSalespersonUseCase,
    UpdateSalespersonUseCase,
    GetSalespersonByIDUseCase,
  ],
})
export class HttpModule {}
