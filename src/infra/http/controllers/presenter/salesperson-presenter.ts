import { Salesperson as DomainSalesperson } from '@/main/crm/enterprise/entities/salesperson';

export class SalespersonPresenter {
  static toHTTP(salesperson: DomainSalesperson) {
    return {
      name: salesperson.name,
      email: salesperson.email,
      phone: salesperson.phone,
      role: salesperson.role,
    };
  }
}
