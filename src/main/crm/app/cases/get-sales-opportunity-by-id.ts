import { Either, left, right } from "@/core/either";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonsRepo } from "../repos/salespersons-repo";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";
import { SalesOpportunityNotFoundError } from "./errors/sales-opportunity-not-found-error";
import { SalesOpportunity } from "../../enterprise/entities/sales-opportunity";
import { SalesOpportunitiesRepo } from "../repos/salesOpportunities-repo";

interface GetSalesOpportunityByIDUseCaseRequest {
  executorID: string;
  salesOpportunityID: string;
}

type GetSalesOpportunityByIDUseCaseResponse = Either<
  SalespersonNotFoundError | NotAllowedError | SalesOpportunityNotFoundError,
  { salesOpportunity: SalesOpportunity }
>;

export class GetSalesOpportunityByIDUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private salesopportunitysRepo: SalesOpportunitiesRepo
  ) {}

  async execute({
    executorID,
    salesOpportunityID,
  }: GetSalesOpportunityByIDUseCaseRequest): Promise<GetSalesOpportunityByIDUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
    }

    const salesOpportunity = await this.salesopportunitysRepo.findByID(
      salesOpportunityID
    );

    if (!salesOpportunity) {
      return left(new SalesOpportunityNotFoundError());
    }

    if (
      executor.role !== SalespersonRole.manager &&
      executor.id.toString() !== salesOpportunity.salesRepID.toString()
    ) {
      return left(new NotAllowedError());
    }

    return right({ salesOpportunity });
  }
}
