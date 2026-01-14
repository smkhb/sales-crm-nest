import { Either, left, right } from '@/core/either';
import { Salesperson } from '../../enterprise/entities/salesperson';
import { SalespersonAlreadyExistsError } from './errors/salesperson-already-exists-error';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { DomainEvents } from '@/core/events/domain-events';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { Injectable } from '@nestjs/common';

interface UpdateSalespersonUseCaseRequest {
  executorRole: SalespersonRole;
  salespersonID: string; // ID of the salesperson to be updated

  // Fields that can be updated
  name?: string;
  email?: string;
  phone?: string;
  role?: SalespersonRole;
}

type UpdateSalespersonUseCaseResponse = Either<
  SalespersonNotFoundError | SalespersonAlreadyExistsError | NotAllowedError,
  { salesperson: Salesperson }
>;

@Injectable()
export class UpdateSalespersonUseCase {
  constructor(private salespersonsRepo: SalespersonsRepo) {}

  async execute({
    executorRole,
    salespersonID,
    name,
    email,
    phone,
    role,
  }: UpdateSalespersonUseCaseRequest): Promise<UpdateSalespersonUseCaseResponse> {
    if (executorRole !== SalespersonRole.manager) {
      return left(new NotAllowedError());
    }

    const salesperson = await this.salespersonsRepo.findByID(salespersonID);

    if (!salesperson) {
      return left(new SalespersonNotFoundError());
    }

    if (email) {
      const salespersonWithSameEmail =
        await this.salespersonsRepo.findByEmail(email);

      if (
        salespersonWithSameEmail &&
        !salesperson.id.equals(salespersonWithSameEmail.id)
      ) {
        return left(new SalespersonAlreadyExistsError(email));
      }
      salesperson.updateEmail(email);
    }

    if (name) salesperson.updateName(name);
    if (phone) salesperson.updatePhone(phone);
    if (role) salesperson.updateRole(role);

    await this.salespersonsRepo.save(salesperson);

    DomainEvents.dispatchEventsForAggregate(salesperson.id);

    return right({ salesperson });
  }
}
