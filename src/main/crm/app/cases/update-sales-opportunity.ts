import { Either, left, Left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { SalesOpportunity } from '../../enterprise/entities/sales-opportunity';
import { SalespersonsRepo } from '../repos/salespersons-repo';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { SalesOpportunitiesRepo } from '../repos/salesOpportunities-repo';
import { SalesOpportunityNotFoundError } from './errors/sales-opportunity-not-found-error';
import { SalesOpportunityStatus } from '../../enterprise/entities/enum/salesOpportunityStatus';
import { DomainEvents } from '@/core/events/domain-events';

interface UpdateSalesOpportunityUseCaseRequest {
  executorID: string;
  salesOpportunityID: string;

  title: string;
  description: string;
  value: number;
  status: SalesOpportunityStatus;
}

type UpdateSalesOpportunityUseCaseResponse = Either<
  SalespersonNotFoundError | NotAllowedError | SalesOpportunityNotFoundError,
  { salesOpportunity: SalesOpportunity }
>;

export class UpdateSalesOpportunityUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private salesOpportunitiesRepo: SalesOpportunitiesRepo,
  ) {}

  async execute({
    executorID,
    salesOpportunityID,
    title,
    description,
    value,
    status,
  }: UpdateSalesOpportunityUseCaseRequest): Promise<UpdateSalesOpportunityUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return new Left(new SalespersonNotFoundError());
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

    salesOpportunity.updateTitle(title);
    salesOpportunity.updateDescription(description);
    salesOpportunity.updateValue(value);
    salesOpportunity.updateStatus(status);

    await this.salesOpportunitiesRepo.save(salesOpportunity);
    DomainEvents.dispatchEventsForAggregate(salesOpportunity.id);

    return right({ salesOpportunity });
  }
}
