import { Either, left, right } from '@/core/either';
import { Salesperson } from '../../enterprise/entities/salesperson';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { Injectable } from '@nestjs/common';

interface InactivateSalespersonUseCaseRequest {
  executorRole: SalespersonRole;
  salespersonID: string;
}

type InactivateSalespersonUseCaseResponse = Either<
  SalespersonNotFoundError | NotAllowedError,
  { salesperson: Salesperson }
>;

@Injectable()
export class InactivateSalespersonUseCase {
  constructor(private salespersonsRepo: SalespersonsRepo) {}

  async execute({
    executorRole,
    salespersonID,
  }: InactivateSalespersonUseCaseRequest): Promise<InactivateSalespersonUseCaseResponse> {
    if (executorRole !== SalespersonRole.manager) {
      return left(new NotAllowedError());
    }

    const salesperson = await this.salespersonsRepo.findByID(salespersonID);

    if (!salesperson) {
      return left(new SalespersonNotFoundError());
    }

    salesperson.deactive();
    await this.salespersonsRepo.save(salesperson);

    return right({ salesperson });
  }
}
