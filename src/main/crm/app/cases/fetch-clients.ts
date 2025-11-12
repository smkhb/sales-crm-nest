import { Either, left, right } from "@/core/either";
import { Client } from "../../enterprise/entities/client";
import { ClientsRepo } from "../repos/clients-repo";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonsRepo } from "../repos/salespersons-repo";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

interface FetchClientsUseCaseRequest {
  executorID: string;
  salesRepID: string;
  page: number;
}

type FetchClientsUseCaseResponse = Either<
  SalespersonNotFoundError | NotAllowedError,
  { clients: Client[] }
>;

export class FetchClientsUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private clientsRepo: ClientsRepo
  ) {}

  async execute({
    executorID,
    salesRepID,
    page = 1,
  }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
    }
    if (
      executor.role !== SalespersonRole.manager &&
      executor.id.toString() !== salesRepID
    ) {
      return left(new NotAllowedError());
    }

    const clients = await this.clientsRepo.findManyBySalesRepID(
      salesRepID,
      page
    );

    return right({ clients });
  }
}
