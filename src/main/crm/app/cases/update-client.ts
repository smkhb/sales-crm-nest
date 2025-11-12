import { Either, left, right } from "@/core/either";
import { Client } from "../../enterprise/entities/client";
import { ClientsRepo } from "../repos/clients-repo";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { DomainEvents } from "@/core/events/domain-events";
import { ClientAlreadyExistsError } from "./errors/client-already-exists-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonsRepo } from "../repos/salespersons-repo";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { ClientNotFoundError } from "./errors/client-not-found-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

interface UpdateClientUseCaseRequest {
  executorID: string;
  clientID: string;

  // Fields that can be updated
  name: string;
  email: string;
  phone: string;
  segment: string;
  salesRepID: string;
}

type UpdateClientUseCaseResponse = Either<
  | ClientAlreadyExistsError
  | NotAllowedError
  | ClientNotFoundError
  | SalespersonNotFoundError,
  { client: Client }
>;

export class UpdateClientUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private clientsRepo: ClientsRepo
  ) {}

  async execute({
    executorID,
    clientID,
    name,
    email,
    phone,
    segment,
    salesRepID,
  }: UpdateClientUseCaseRequest): Promise<UpdateClientUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
    }

    const client = await this.clientsRepo.findByID(clientID);

    if (!client) {
      return left(new ClientNotFoundError());
    }

    const doesNewSalesRepExists = await this.salespersonsRepo.findByID(
      salesRepID
    );

    if (!doesNewSalesRepExists) {
      return left(new SalespersonNotFoundError());
    }

    if (
      executor.role !== SalespersonRole.manager &&
      executor.id.toString() !== client.salesRepID.toString()
    ) {
      return left(new NotAllowedError());
    }

    const clientWithSameEmail = await this.clientsRepo.findByEmail(email);

    if (clientWithSameEmail && !client.id.equals(clientWithSameEmail.id)) {
      return left(new ClientAlreadyExistsError(email));
    }

    client.updateName(name);
    client.updateEmail(email);
    client.updatePhone(phone);
    client.updateSegment(segment);
    client.updateSalesRepID(new UniqueEntityID(salesRepID));

    await this.clientsRepo.save(client);

    DomainEvents.dispatchEventsForAggregate(client.id);

    return right({ client: client });
  }
}
