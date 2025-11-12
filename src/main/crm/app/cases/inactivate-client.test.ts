import { InMemoClientsRepo } from "tests/repos/in-memo-clients-repo";
import { DomainEvents } from "@/core/events/domain-events";
import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { makeClient } from "tests/factories/make-client";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { ClientNotFoundError } from "./errors/client-not-found-error";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { InactivateClientUseCase } from "./inactivate-client";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

let clientsRepo: InMemoClientsRepo;
let salespersonsRepo: InMemoSalespersonsRepo;
let sut: InactivateClientUseCase;

describe("Inactivate Client", () => {
  beforeEach(() => {
    clientsRepo = new InMemoClientsRepo();
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new InactivateClientUseCase(salespersonsRepo, clientsRepo);
    DomainEvents.clearHandlers();
  });

  it("should be able to inactivate a client if the executor is the Sales Representent", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: client.salesRepID.toString(),
      clientID: client.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepo.items[0]).toEqual(
      expect.objectContaining({
        status: "inactive",
      })
    );
  });

  it("should be able to update a client if the executor is a Manager", async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id }); //! Client's sales rep is not the manager
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      clientID: client.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepo.items[0]).toEqual(
      expect.objectContaining({
        status: "inactive",
      })
    );
  });

  it("should not be able to update a client if the executor is not the Sales Representent or Manager", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const randomSalesRep = makeSalesperson();
    salespersonsRepo.items.push(randomSalesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: randomSalesRep.id.toString(),
      clientID: client.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to update a non existing client", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      clientID: "non-existing-client-id",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClientNotFoundError);
  });

  it("should not be able to inactivate a client if the executor is non existing", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: "non-existing-salesperson-id",
      clientID: client.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });
});
