/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClientsRepo } from '@/main/crm/app/repos/clients-repo';
import { PrismaClientMappers } from '../mappers/prisma-client-mappers';
import { Client } from '@/main/crm/enterprise/entities/client';

@Injectable()
export class PrismaClientsRepo implements ClientsRepo {
  constructor(private prisma: PrismaService) {}

  // * To Prisma Actions

  async create(client: Client): Promise<void> {
    const data = PrismaClientMappers.toPrisma(client);

    await this.prisma.client.create({
      data,
    });
  }

  async save(client: Client): Promise<void> {
    const data = PrismaClientMappers.toPrisma(client);

    await this.prisma.client.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(client: Client): Promise<void> {
    const data = PrismaClientMappers.toPrisma(client);

    await this.prisma.client.delete({ where: { id: data.id } });
  }

  // * To Domain Actions

  async findByID(id: string): Promise<Client | null> {
    if (!id) return null;

    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return null;
    }

    return PrismaClientMappers.toDomain(client);
  }

  async findByEmail(email: string): Promise<Client | null> {
    if (!email) return null;

    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      return null;
    }
    return PrismaClientMappers.toDomain(client);
  }

  async findManyBySalesRepID(
    salesRepID: string,
    page: number,
  ): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: { salesRepID },
      skip: (page - 1) * 20,
      take: 20,
    });

    return clients.map((client) => PrismaClientMappers.toDomain(client));
  }
}
