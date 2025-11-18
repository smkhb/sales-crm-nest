/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { SalespersonsRepo } from '@/main/crm/app/repos/salespersons-repo';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Salesperson } from '@/main/crm/enterprise/entities/salesperson';
import { PrismaSalespersonMappers } from '../mappers/prisma-salesperson-mappers';

@Injectable()
export class PrismaSalespersonsRepo implements SalespersonsRepo {
  constructor(private prisma: PrismaService) {}

  // * To Prisma Actions

  async create(salesperson: Salesperson): Promise<void> {
    const data = PrismaSalespersonMappers.toPrisma(salesperson);

    await this.prisma.salesperson.create({
      data,
    });
  }

  async save(salesperson: Salesperson): Promise<void> {
    const data = PrismaSalespersonMappers.toPrisma(salesperson);

    await this.prisma.salesperson.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(salesperson: Salesperson): Promise<void> {
    const data = PrismaSalespersonMappers.toPrisma(salesperson);

    await this.prisma.salesperson.delete({ where: { id: data.id } });
  }

  // * To Domain Actions

  async findByID(id: string): Promise<Salesperson | null> {
    if (!id) return null;
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id },
    });

    if (!salesperson) {
      return null;
    }

    return PrismaSalespersonMappers.toDomain(salesperson);
  }

  async findByEmail(email: string): Promise<Salesperson | null> {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { email },
    });

    if (!salesperson) {
      return null;
    }

    return PrismaSalespersonMappers.toDomain(salesperson);
  }

  async findMany(page: number): Promise<Salesperson[]> {
    const salespersons = await this.prisma.salesperson.findMany({
      skip: (page - 1) * 20,
      take: 20,
    });

    return salespersons.map((salesperson) =>
      PrismaSalespersonMappers.toDomain(salesperson),
    );
  }
}
