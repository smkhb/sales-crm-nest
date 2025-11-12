import { Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { SalesOpportunitiesRepo } from '../repos/salesOpportunities-repo';
import { SalesOpportunity } from '../../enterprise/entities/sales-opportunity';

interface FetchSalesOpportunitiesUseCaseRequest {
  executorID: string;
  salespersonID: string | null;
  page: number;
}

type FetchSalesOpportunitiesUseCaseResponse = Either<
  SalespersonNotFoundError | NotAllowedError,
  { salesOpportunities: SalesOpportunity[] }
>;

export class FetchSalesOpportunitiesUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private salesOpportunitiesRepo: SalesOpportunitiesRepo,
  ) {}

  async execute({
    executorID,
    salespersonID,
    page = 1,
  }: FetchSalesOpportunitiesUseCaseRequest): Promise<FetchSalesOpportunitiesUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
    }

    if (
      executor.role !== SalespersonRole.manager &&
      executor.id.toString() !== salespersonID
    ) {
      return left(new NotAllowedError());
    }

    // ! Manager can fetch all or by salesperson ID
    if (executor.role === SalespersonRole.manager) {
      if (salespersonID) {
        const salesperson = await this.salespersonsRepo.findByID(salespersonID);
        if (!salesperson) return left(new SalespersonNotFoundError());

        const salesOpportunities =
          await this.salesOpportunitiesRepo.findManyBySalespersonID(
            salespersonID,
            page,
          );

        return right({ salesOpportunities });
      }
      const salesOpportunities =
        await this.salesOpportunitiesRepo.findMany(page);

      return right({ salesOpportunities });
    }

    // ! Salesperson can fetch only their own sales opportunities
    const salesOpportunities =
      await this.salesOpportunitiesRepo.findManyBySalespersonID(
        executor.id.toString(),
        page,
      );
    return right({ salesOpportunities });
  }
}
