import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { RegisterSalespersonController } from './controllers/register-salesperson.controller';
import { RegisterSalespersonUseCase } from '@/main/crm/app/cases/register-salesperson';
import { CryptModule } from '../crypt/crypt.module';
import { RegisterClientController } from './controllers/register-client.controller';
import { RegisterClientUseCase } from '@/main/crm/app/cases/register-client';

@Module({
  imports: [DbModule, CryptModule],
  controllers: [RegisterSalespersonController, RegisterClientController],
  providers: [RegisterSalespersonUseCase, RegisterClientUseCase],
})
export class HttpModule {}
