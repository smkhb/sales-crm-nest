import { Either, left, right } from '@/core/either';
import { Salesperson } from '../../enterprise/entities/salesperson';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';

import { SalespersonsRepo } from '../repos/salespersons-repo';

interface FetchSalespersonUseCaseRequest {
  executorRole: SalespersonRole;
  page: number;
}

type FetchSalespersonUseCaseResponse = Either<
  NotAllowedError,
  { salespersons: Salesperson[] }
>;

export class FetchSalespersonUseCase {
  constructor(private salespersonsRepo: SalespersonsRepo) {}

  async execute({
    executorRole,
    page = 1,
  }: FetchSalespersonUseCaseRequest): Promise<FetchSalespersonUseCaseResponse> {
    if (executorRole !== SalespersonRole.manager) {
      return left(new NotAllowedError());
    }

    const salespersons = await this.salespersonsRepo.findMany(page);

    return right({ salespersons });
  }
}
