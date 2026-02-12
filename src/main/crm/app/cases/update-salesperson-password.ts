import { Either, left, right } from '@/core/either';
import { Salesperson } from '../../enterprise/entities/salesperson';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { DomainEvents } from '@/core/events/domain-events';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { HashGenerator } from '../cryptography/hash-generator';
import { Injectable } from '@nestjs/common';

interface UpdateSalespersonPasswordUseCaseRequest {
  executorRole: SalespersonRole;
  salespersonID: string;
  newPassword: string;
}

type UpdateSalespersonPasswordUseCaseResponse = Either<
  SalespersonNotFoundError | NotAllowedError,
  { salesperson: Salesperson }
>;

@Injectable()
export class UpdateSalespersonPasswordUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    executorRole,
    salespersonID,
    newPassword,
  }: UpdateSalespersonPasswordUseCaseRequest): Promise<UpdateSalespersonPasswordUseCaseResponse> {
    if (executorRole !== SalespersonRole.manager) {
      return left(new NotAllowedError());
    }

    const salesperson = await this.salespersonsRepo.findByID(salespersonID);

    if (!salesperson) {
      return left(new SalespersonNotFoundError());
    }

    const newPasswordHash = await this.hashGenerator.hash(newPassword);
    salesperson.updatePasswordHash(newPasswordHash);

    await this.salespersonsRepo.save(salesperson);

    DomainEvents.dispatchEventsForAggregate(salesperson.id);

    return right({ salesperson });
  }
}
