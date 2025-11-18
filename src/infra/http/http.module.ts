import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { RegisterSalespersonController } from './controllers/register-salesperson.controller';
import { RegisterSalespersonUseCase } from '@/main/crm/app/cases/register-salesperson';
import { CryptModule } from '../crypt/crypt.module';

@Module({
  imports: [DbModule, CryptModule],
  controllers: [RegisterSalespersonController],
  providers: [RegisterSalespersonUseCase],
})
export class HttpModule {}
