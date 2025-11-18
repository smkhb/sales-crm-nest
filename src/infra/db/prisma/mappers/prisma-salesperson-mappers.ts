import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Salesperson as DomainSalesperson } from '@/main/crm/enterprise/entities/salesperson';
import { Salesperson as PrismaSalesperson } from '@prisma/client';

export class PrismaSalespersonMappers {
  static toPrisma(domainSalesperson: DomainSalesperson) {
    return {
      id: domainSalesperson.id.toString(),
      name: domainSalesperson.name,
      email: domainSalesperson.email,
      password: domainSalesperson.passwordHash,
      phone: domainSalesperson.phone,
    };
  }

  static toDomain(prismaSalesperson: PrismaSalesperson): DomainSalesperson {
    return DomainSalesperson.create(
      {
        name: prismaSalesperson.name,
        email: prismaSalesperson.email,
        passwordHash: prismaSalesperson.password,
        phone: prismaSalesperson.phone,
      },
      new UniqueEntityID(prismaSalesperson.id),
    );
  }
}
