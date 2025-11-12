import { Either, left, right } from "@/core/either";
import { Client } from "../../enterprise/entities/client";
import { ClientsRepo } from "../repos/clients-repo";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonsRepo } from "../repos/salespersons-repo";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { ClientNotFoundError } from "./errors/client-not-found-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

interface GetClientByIDUseCaseRequest {
  executorID: string;
  clientID: string;
}

type GetClientByIDUseCaseResponse = Either<
  SalespersonNotFoundError | NotAllowedError | ClientNotFoundError,
  { client: Client }
>;

export class GetClientByIDUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private clientsRepo: ClientsRepo
  ) {}

  async execute({
    executorID,
    clientID,
  }: GetClientByIDUseCaseRequest): Promise<GetClientByIDUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
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

    return right({ client });
  }
}
