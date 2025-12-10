import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SalespersonsRepo } from '@/main/crm/app/repos/salespersons-repo';
import { PrismaSalespersonsRepo } from './prisma/repos/prisma-salespersons-repo';
import { ClientsRepo } from '@/main/crm/app/repos/clients-repo';
import { PrismaClientsRepo } from './prisma/repos/prisma-clients-repo';

@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: SalespersonsRepo,
      useClass: PrismaSalespersonsRepo,
    },
    {
      provide: ClientsRepo,
      useClass: PrismaClientsRepo,
    },
  ],
  exports: [PrismaService, SalespersonsRepo, ClientsRepo],
})
export class DbModule {}
