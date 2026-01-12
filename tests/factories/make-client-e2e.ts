/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { PrismaService } from '@/infra/db/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ClientFactoryE2E {
  constructor(private prisma: PrismaService) {}

  async makePrismaClient(override: any = {}) {
    return this.prisma.client.create({
      data: {
        id: randomUUID(),
        name: 'Acme Corporation',
        email: `contact-${randomUUID()}@acme.com`,
        phone: '987654321',
        segment: 'Technology',
        ...override,
      },
    });
  }
}
