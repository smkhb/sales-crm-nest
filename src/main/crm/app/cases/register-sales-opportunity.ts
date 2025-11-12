import { Either, left, Left, right } from "@/core/either";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { ClientNotFoundError } from "./errors/client-not-found-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";
import { SalesOpportunity } from "../../enterprise/entities/sales-opportunity";
import { SalespersonsRepo } from "../repos/salespersons-repo";
import { ClientsRepo } from "../repos/clients-repo";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { SalesOpportunitiesRepo } from "../repos/salesOpportunities-repo";
import { DomainEvents } from "@/core/events/domain-events";

interface RegisterSalesOpportunityUseCaseRequest {
  executorID: string;
  clientID: string;
  salesRepID: string;
  title: string;
  description: string;
  value: number;
}

type RegisterSalesOpportunityUseCaseResponse = Either<
  SalespersonNotFoundError | ClientNotFoundError | NotAllowedError,
  { salesOpportunity: SalesOpportunity }
>;

export class RegisterSalesOpportunityUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private clientsRepo: ClientsRepo,
    private salesOpportunitiesRepo: SalesOpportunitiesRepo
  ) {}

  async execute({
    executorID,
    clientID,
    salesRepID,
    title,
    description,
    value,
  }: RegisterSalesOpportunityUseCaseRequest): Promise<RegisterSalesOpportunityUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return new Left(new SalespersonNotFoundError());
    }

    const client = await this.clientsRepo.findByID(clientID);

    if (!client) {
      return left(new ClientNotFoundError());
    }

    if (
      executor.role !== SalespersonRole.manager &&
      executor.id.toString() !== client.salesRepID.toString()
    ) {
      return left(new NotAllowedError());
    }

    const salesOpportunity = SalesOpportunity.create({
      creatorID: executor.id,
      clientID: client.id,
      salesRepID: new UniqueEntityID(salesRepID),
      title,
      description,
      value,
    });

    this.salesOpportunitiesRepo.create(salesOpportunity);
    DomainEvents.dispatchEventsForAggregate(salesOpportunity.id);

    return right({ salesOpportunity });
  }
}
