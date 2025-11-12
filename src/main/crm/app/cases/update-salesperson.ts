import { Either, left, right } from '@/core/either';
import { Salesperson } from '../../enterprise/entities/salesperson';
import { SalespersonAlreadyExistsError } from './errors/salesperson-already-exists-error';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { DomainEvents } from '@/core/events/domain-events';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';

interface UpdateSalespersonUseCaseRequest {
  executorRole: SalespersonRole;
  salespersonID: string; // ID of the salesperson to be updated

  // Fields that can be updated
  name: string;
  email: string;
  phone: string;
  role: SalespersonRole;
}

type UpdateSalespersonUseCaseResponse = Either<
  SalespersonNotFoundError | SalespersonAlreadyExistsError | NotAllowedError,
  { salesperson: Salesperson }
>;

export class UpdateSalespersonUseCase {
  constructor(private salespersonsRepo: SalespersonsRepo) {}

  async execute({
    executorRole,
    salespersonID,
    name,
    email,
    phone,
  }: UpdateSalespersonUseCaseRequest): Promise<UpdateSalespersonUseCaseResponse> {
    if (executorRole !== SalespersonRole.manager) {
      return left(new NotAllowedError());
    }

    const salesperson = await this.salespersonsRepo.findByID(salespersonID);

    if (!salesperson) {
      return left(new SalespersonNotFoundError());
    }

    const salespersonWithSameEmail =
      await this.salespersonsRepo.findByEmail(email);

    if (
      salespersonWithSameEmail &&
      !salesperson.id.equals(salespersonWithSameEmail.id)
    ) {
      return left(new SalespersonAlreadyExistsError(email));
    }

    salesperson.updateName(name);
    salesperson.updateEmail(email);
    salesperson.updatePhone(phone);
    salesperson.updateRole(executorRole);

    await this.salespersonsRepo.save(salesperson);

    DomainEvents.dispatchEventsForAggregate(salesperson.id);

    return right({ salesperson });
  }
}
