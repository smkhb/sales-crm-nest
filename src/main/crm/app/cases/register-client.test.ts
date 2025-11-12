import { InMemoClientsRepo } from "tests/repos/in-memo-clients-repo";
import { RegisterClientUseCase } from "./register-client";
import { DomainEvents } from "@/core/events/domain-events";
import { ClientAlreadyExistsError } from "./errors/client-already-exists-error";
import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { makeClient } from "tests/factories/make-client";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

let clientsRepo: InMemoClientsRepo;
let salespersonsRepo: InMemoSalespersonsRepo;

let sut: RegisterClientUseCase;

describe("Register Client", () => {
  beforeEach(() => {
    clientsRepo = new InMemoClientsRepo();
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new RegisterClientUseCase(clientsRepo, salespersonsRepo);
    DomainEvents.clearHandlers();
  });

  it("should be able to register a new client", async () => {
    const salesperson = makeSalesperson();
    await salespersonsRepo.create(salesperson);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "11999999999",
      segment: "SMB",
      salesRepID: "sales-rep-id",
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepo.items[0]).toEqual(
      expect.objectContaining({
        name: "John Doe",
        email: "johndoe@example.com",
      })
    );
    expect(clientsRepo.items[0]?.creatorID.toString()).toEqual("sales-rep-id");
    expect(clientsRepo.items[0]?.salesRepID.toString()).toEqual("sales-rep-id");
    expect(clientsRepo.items).toHaveLength(1);
  });

  it("should not be able to register a new client with an existing email", async () => {
    const salesperson = makeSalesperson();
    await salespersonsRepo.create(salesperson);

    const client = makeClient({
      email: "johndoe@example.com",
    });

    await clientsRepo.create(client);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "11999999999",
      segment: "SMB",
      salesRepID: "sales-rep-id",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClientAlreadyExistsError);
    expect(clientsRepo.items).toHaveLength(1);
  });

  it("should not be able to register a new client without an existing executorID", async () => {
    const result = await sut.execute({
      executorID: "non-existing-executor-id",
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "11999999999",
      segment: "SMB",
      salesRepID: "sales-rep-id",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });
});
