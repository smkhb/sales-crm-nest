import { InMemoClientsRepo } from "tests/repos/in-memo-clients-repo";
import { InMemoSalesOpportunitiesRepo } from "tests/repos/in-memo-sales-opportunity-repo";
import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { RegisterSalesOpportunityUseCase } from "./register-sales-opportunity";
import { DomainEvents } from "@/core/events/domain-events";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { makeClient } from "tests/factories/make-client";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";
import { ClientNotFoundError } from "./errors/client-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { OnSalesOpportunityCreated } from "../handlers/on-sales-opportunity-created";

let salespersonsRepo: InMemoSalespersonsRepo;
let clientsRepo: InMemoClientsRepo;
let salesOpportunitiesRepo: InMemoSalesOpportunitiesRepo;
let sut: RegisterSalesOpportunityUseCase;

describe("Register Sales Opportunity", () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    clientsRepo = new InMemoClientsRepo();
    salesOpportunitiesRepo = new InMemoSalesOpportunitiesRepo();
    sut = new RegisterSalesOpportunityUseCase(
      salespersonsRepo,
      clientsRepo,
      salesOpportunitiesRepo
    );

    DomainEvents.clearHandlers();
    new OnSalesOpportunityCreated();
  });

  it("should be able to register a new sales opportunity", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      clientID: client.id.toString(),
      salesRepID: salesperson.id.toString(),
      title: "New Sales Opportunity",
      description: "This is a new sales opportunity.",
      value: 10000,
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        title: "New Sales Opportunity",
        description: "This is a new sales opportunity.",
        value: 10000,
      })
    );
  });

  it("should be able to register a new sales opportunity when the executor is a manager", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      clientID: client.id.toString(),
      salesRepID: salesperson.id.toString(),
      title: "New Sales Opportunity",
      description: "This is a new sales opportunity.",
      value: 10000,
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        title: "New Sales Opportunity",
        description: "This is a new sales opportunity.",
        value: 10000,
      })
    );
    expect(salesOpportunitiesRepo.items[0]?.creatorID.toString()).toEqual(
      manager.id.toString()
    );
    expect(salesOpportunitiesRepo.items[0]?.salesRepID.toString()).toEqual(
      salesperson.id.toString()
    );
  });

  it("should not be able to register a new sales opportunity when the executor does not exist", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: "non-existing-executor-id",
      clientID: client.id.toString(),
      salesRepID: salesperson.id.toString(),
      title: "New Sales Opportunity",
      description: "This is a new sales opportunity.",
      value: 10000,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it("should not be able to register a new sales opportunity when the client does not exist", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      clientID: "non-existing-client-id",
      salesRepID: salesperson.id.toString(),
      title: "New Sales Opportunity",
      description: "This is a new sales opportunity.",
      value: 10000,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClientNotFoundError);
  });

  it("should not allow registering when executor is neither the client's rep nor a manager", async () => {
    const clientRep = makeSalesperson();
    salespersonsRepo.items.push(clientRep);

    const client = makeClient();
    clientsRepo.items.push(client);

    const otherSalesperson = makeSalesperson(); // not the client rep and not a manager
    salespersonsRepo.items.push(otherSalesperson);

    const result = await sut.execute({
      executorID: otherSalesperson.id.toString(),
      clientID: client.id.toString(),
      salesRepID: clientRep.id.toString(),
      title: "Unauthorized Sales Opportunity",
      description:
        "Attempt by a salesperson who is not the client's rep or a manager.",
      value: 10000,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should trigger a domain event upon creating a new sales opportunity", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      clientID: client.id.toString(),
      salesRepID: salesperson.id.toString(),
      title: "New Sales Opportunity",
      description: "This is a new sales opportunity.",
      value: 10000,
    });

    expect(result.isRight()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
