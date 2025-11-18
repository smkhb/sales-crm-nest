import { Either, left, right } from '@/core/either';
import { Salesperson } from '../../enterprise/entities/salesperson';
import { DomainEvents } from '@/core/events/domain-events';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { HashGenerator } from '../cryptography/hash-generator';
import { SalespersonAlreadyExistsError } from './errors/salesperson-already-exists-error';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { Injectable } from '@nestjs/common';

interface RegisterSalespersonUseCaseRequest {
  executorID: string;
  name: string;
  email: string;
  password: string; // Plain text password
  phone: string;
}

type RegisterSalespersonUseCaseResponse = Either<
  SalespersonAlreadyExistsError | NotAllowedError | SalespersonNotFoundError,
  { salesperson: Salesperson }
>;

@Injectable()
export class RegisterSalespersonUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    executorID,
    name,
    email,
    password,
    phone,
  }: RegisterSalespersonUseCaseRequest): Promise<RegisterSalespersonUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
    }

    if (executor.role !== SalespersonRole.manager) {
      return left(new NotAllowedError());
    }

    const doesSalespersonExist = await this.salespersonsRepo.findByEmail(email);

    if (doesSalespersonExist) {
      return left(new SalespersonAlreadyExistsError(email));
    }

    const passwordHash = await this.hashGenerator.hash(password);

    const salesperson = Salesperson.create({
      name,
      email,
      passwordHash,
      phone,
    });

    await this.salespersonsRepo.create(salesperson);

    DomainEvents.dispatchEventsForAggregate(salesperson.id);

    return right({ salesperson });
  }
}
