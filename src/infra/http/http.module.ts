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
import { FetchSalespersonController } from './controllers/fetch-salespersons.controller';
import { FetchSalespersonUseCase } from '@/main/crm/app/cases/fetch-salesperson';
import { InactivateSalespersonController } from './controllers/inactivate-salesperson.controller';
import { InactivateSalespersonUseCase } from '@/main/crm/app/cases/inactivate-salesperson';
import { UpdateSalespersonPasswordController } from './controllers/update-salesperson-password.controller';
import { UpdateSalespersonPasswordUseCase } from '@/main/crm/app/cases/update-salesperson-password';

@Module({
  imports: [DbModule, CryptModule],
  controllers: [
    RegisterSalespersonController,
    RegisterClientController,
    AuthenticateSalespersonController,
    UpdateSalespersonController,
    GetSalespersonByIDController,
    FetchSalespersonController,
    InactivateSalespersonController,
    UpdateSalespersonPasswordController,
  ],
  providers: [
    RegisterSalespersonUseCase,
    RegisterClientUseCase,
    AuthenticateSalespersonUseCase,
    UpdateSalespersonUseCase,
    GetSalespersonByIDUseCase,
    FetchSalespersonUseCase,
    InactivateSalespersonUseCase,
    UpdateSalespersonPasswordUseCase,
  ],
})
export class HttpModule {}
