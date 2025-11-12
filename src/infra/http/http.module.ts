import { Module } from '@nestjs/common';
import { RegisterClientController } from './controllers/register-client.controller';
import { RegisterClientUseCase } from '@/main/crm/app/cases/register-client';

@Module({
  imports: [],
  controllers: [RegisterClientController],
  providers: [RegisterClientUseCase],
})
export class HttpModule {}
