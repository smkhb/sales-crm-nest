import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Client as DomainClient } from '@/main/crm/enterprise/entities/client';
import { ClientStatus as DomainClientStatus } from '@/main/crm/enterprise/entities/enum/clientStatus';

import {
  Client as PrismaClient,
  ClientStatus as PrismaClientStatus,
} from '@prisma/client';

export class PrismaClientMappers {
  static toPrisma(domainClient: DomainClient) {
    return {
      id: domainClient.id.toString(),
      name: domainClient.name,
      email: domainClient.email,
      phone: domainClient.phone,
      segment: domainClient.segment,
      status: mapDomainStatusToPrisma(domainClient.status),
      salesRepID: domainClient.salesRepID.toString(),
    };
  }

  static toDomain(prismaClient: PrismaClient): DomainClient {
    return DomainClient.create(
      {
        name: prismaClient.name,
        email: prismaClient.email,
        phone: prismaClient.phone,
        segment: prismaClient.segment,
        status: prismaClient.status as DomainClientStatus,
        salesRepID: new UniqueEntityID(prismaClient.salesRepID),
      },
      new UniqueEntityID(prismaClient.id),
    );
  }
}

type StatusKey = keyof typeof PrismaClientStatus;

function mapDomainStatusToPrisma(
  domainStatus: DomainClientStatus,
): PrismaClientStatus {
  return PrismaClientStatus[domainStatus as StatusKey];
}
