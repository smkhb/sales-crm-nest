import { Salesperson } from '../../enterprise/entities/salesperson';

export abstract class SalespersonsRepo {
  abstract create(salesperson: Salesperson): Promise<void>;
  abstract save(salesperson: Salesperson): Promise<void>;
  abstract delete(salesperson: Salesperson): Promise<void>;

  abstract findByID(id: string): Promise<Salesperson | null>;
  abstract findByEmail(email: string): Promise<Salesperson | null>;
  abstract findMany(page: number): Promise<Salesperson[]>;
}
