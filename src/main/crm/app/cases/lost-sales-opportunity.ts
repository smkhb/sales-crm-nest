import { Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { SalesOpportunitiesRepo } from '../repos/salesOpportunities-repo';
import { SalesOpportunityNotFoundError } from './errors/sales-opportunity-not-found-error';
import { CantMarkSalesOpportunityAsLostError } from '../../enterprise/entities/errors/cant-mark-sales-opportunity-as-lost-error';
import { DomainEvents } from '@/core/events/domain-events';

interface LostSalesOpportunityUseCaseRequest {
  executorID: string;
  salesOpportunityID: string;
}

type LostSalesOpportunityUseCaseResponse = Either<
  | SalespersonNotFoundError
  | NotAllowedError
  | SalesOpportunityNotFoundError
  | CantMarkSalesOpportunityAsLostError,
  null
>;

export class LostSalesOpportunityUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private salesOpportunitiesRepo: SalesOpportunitiesRepo,
  ) {}

  async execute({
    executorID,
    salesOpportunityID,
  }: LostSalesOpportunityUseCaseRequest): Promise<LostSalesOpportunityUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
    }

    const salesOpportunity =
      await this.salesOpportunitiesRepo.findByID(salesOpportunityID);

    if (!salesOpportunity) {
      return left(new SalesOpportunityNotFoundError());
    }

    if (
      executor.role !== SalespersonRole.manager &&
      executor.id.toString() !== salesOpportunity.salesRepID.toString()
    ) {
      return left(new NotAllowedError());
    }

    const result = salesOpportunity.markAsLost();
    DomainEvents.dispatchEventsForAggregate(salesOpportunity.id);

    if (result.isLeft()) {
      return left(result.value);
    }

    await this.salesOpportunitiesRepo.save(salesOpportunity);

    return right(null);
  }
}
