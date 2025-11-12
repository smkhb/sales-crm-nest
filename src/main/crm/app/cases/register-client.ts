import { Either, left, right } from "@/core/either";
import { ClientsRepo } from "../repos/clients-repo";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Client } from "../../enterprise/entities/client";
import { DomainEvents } from "@/core/events/domain-events";
import { ClientAlreadyExistsError } from "./errors/client-already-exists-error";
import { SalespersonsRepo } from "../repos/salespersons-repo";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

interface RegisterClientUseCaseRequest {
  executorID: string;

  name: string;
  email: string;
  phone: string;
  segment: string;
  salesRepID: string;
}

type RegisterClientUseCaseResponse = Either<
  ClientAlreadyExistsError | SalespersonNotFoundError,
  { client: Client }
>;

export class RegisterClientUseCase {
  constructor(
    private clientsRepo: ClientsRepo,
    private salespersonsRepo: SalespersonsRepo
  ) {}

  async execute({
    executorID,
    name,
    email,
    phone,
    segment,
    salesRepID,
  }: RegisterClientUseCaseRequest): Promise<RegisterClientUseCaseResponse> {
    const executor = await this.salespersonsRepo.findByID(executorID);

    if (!executor) {
      return left(new SalespersonNotFoundError());
    }

    const doescClientExist = await this.clientsRepo.findByEmail(email);

    if (doescClientExist) {
      return left(new ClientAlreadyExistsError(email));
    }

    const client = Client.create({
      name,
      email,
      phone,
      segment,
      salesRepID: new UniqueEntityID(salesRepID),
    });

    await this.clientsRepo.create(client);

    DomainEvents.dispatchEventsForAggregate(client.id);

    return right({ client });
  }
}
