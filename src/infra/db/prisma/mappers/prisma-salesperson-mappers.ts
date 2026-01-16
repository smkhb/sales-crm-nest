import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { SalespersonRole as DomainSalespersonRole } from '@/main/crm/enterprise/entities/enum/salespersonRole';
import { Salesperson as DomainSalesperson } from '@/main/crm/enterprise/entities/salesperson';
import {
  Salesperson as PrismaSalesperson,
  SalespersonRole as PrismaSalespersonRole,
} from '@prisma/client';

export class PrismaSalespersonMappers {
  static toPrisma(domainSalesperson: DomainSalesperson) {
    return {
      id: domainSalesperson.id.toString(),
      name: domainSalesperson.name,
      email: domainSalesperson.email,
      password: domainSalesperson.passwordHash,
      phone: domainSalesperson.phone,
      role: mapDomainRoleToPrisma(domainSalesperson.role),
      isActive: domainSalesperson.isActive,
      createdAt: domainSalesperson.createdAt,
      updatedAt: domainSalesperson.updatedAt || undefined,
    };
  }

  static toDomain(prismaSalesperson: PrismaSalesperson): DomainSalesperson {
    return DomainSalesperson.create(
      {
        name: prismaSalesperson.name,
        email: prismaSalesperson.email,
        passwordHash: prismaSalesperson.password,
        phone: prismaSalesperson.phone,
        role: prismaSalesperson.role as DomainSalespersonRole,
      },
      new UniqueEntityID(prismaSalesperson.id),
    );
  }
}

type RoleKey = keyof typeof PrismaSalespersonRole;
function mapDomainRoleToPrisma(
  domainRole: DomainSalespersonRole,
): PrismaSalespersonRole {
  return PrismaSalespersonRole[domainRole as RoleKey];
}
