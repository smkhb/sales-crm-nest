import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SalespersonsRepo } from '@/main/crm/app/repos/salespersons-repo';
import { PrismaSalespersonsRepo } from './prisma/repos/prisma-salespersons-repo';

@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: SalespersonsRepo,
      useClass: PrismaSalespersonsRepo,
    },
  ],
  exports: [PrismaService, SalespersonsRepo],
})
export class DbModule {}
