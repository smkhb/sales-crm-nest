import { InMemoClientsRepo } from "tests/repos/in-memo-clients-repo";
import { DomainEvents } from "@/core/events/domain-events";
import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { makeClient } from "tests/factories/make-client";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { InMemoSalesOpportunitiesRepo } from "tests/repos/in-memo-sales-opportunity-repo";
import { FetchSalesOpportunitiesUseCase } from "./fetch-sales-opportunity";
import { makeSalesOpportunity } from "tests/factories/make-sales-opportunity";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

let clientsRepo: InMemoClientsRepo;
let salesOpportunitiesRepo: InMemoSalesOpportunitiesRepo;
let salespersonsRepo: InMemoSalespersonsRepo;
let sut: FetchSalesOpportunitiesUseCase;

describe("Fetch sales opportunities", () => {
  beforeEach(() => {
    clientsRepo = new InMemoClientsRepo();
    salespersonsRepo = new InMemoSalespersonsRepo();
    salesOpportunitiesRepo = new InMemoSalesOpportunitiesRepo();
    sut = new FetchSalesOpportunitiesUseCase(
      salespersonsRepo,
      salesOpportunitiesRepo
    );
    DomainEvents.clearHandlers();
  });

  it("should be able to fetch especific sales opportunities as a Sales Rep", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 5; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${i}`,
        salesRepID: salesRep.id,
        clientID: client.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      salespersonID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salesOpportunities: expect.arrayContaining([
        expect.objectContaining({ title: "Opportunity 1" }),
        expect.objectContaining({ title: "Opportunity 2" }),
        expect.objectContaining({ title: "Opportunity 3" }),
        expect.objectContaining({ title: "Opportunity 4" }),
        expect.objectContaining({ title: "Opportunity 5" }),
      ]),
    });
  });

  it("should be able to fetch paginated sales opportunities", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 22; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${i}`,
        salesRepID: salesRep.id,
        clientID: client.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      salespersonID: salesRep.id.toString(),
      page: 2,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salesOpportunities: expect.arrayContaining([
        expect.objectContaining({ title: "Opportunity 21" }),
        expect.objectContaining({ title: "Opportunity 22" }),
      ]),
    });
  });

  it("should be able to fetch especific sales opportunities as a Manager", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 5; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${i}`,
        salesRepID: salesRep.id,
        clientID: client.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      salespersonID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salesOpportunities: expect.arrayContaining([
        expect.objectContaining({ title: "Opportunity 1" }),
        expect.objectContaining({ title: "Opportunity 2" }),
        expect.objectContaining({ title: "Opportunity 3" }),
        expect.objectContaining({ title: "Opportunity 4" }),
        expect.objectContaining({ title: "Opportunity 5" }),
      ]),
    });
  });

  it("should be able to fetch all sales opportunities as a Manager", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 3; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${i}`,
        salesRepID: salesRep.id,
        clientID: client.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const salesRep2 = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client2 = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 3; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${3 + i}`,
        salesRepID: salesRep2.id,
        clientID: client2.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      salespersonID: null,
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salesOpportunities: expect.arrayContaining([
        expect.objectContaining({ title: "Opportunity 1" }),
        expect.objectContaining({ title: "Opportunity 2" }),
        expect.objectContaining({ title: "Opportunity 3" }),
        expect.objectContaining({ title: "Opportunity 4" }),
        expect.objectContaining({ title: "Opportunity 5" }),
        expect.objectContaining({ title: "Opportunity 6" }),
      ]),
    });
  });

  it("should not be able to fetch sales opportunities as non existing executor", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 5; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${i}`,
        salesRepID: salesRep.id,
        clientID: client.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const result = await sut.execute({
      executorID: "non-existing-id",
      salespersonID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it("should not be able to fetch sales opportunities as a random executor", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 5; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${i}`,
        salesRepID: salesRep.id,
        clientID: client.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const random = makeSalesperson();
    salespersonsRepo.items.push(random);

    const result = await sut.execute({
      executorID: random.id.toString(),
      salespersonID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to fetch sales opportunities if sales rep does not exist", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);
    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    for (let i = 1; i <= 5; i++) {
      const salesOpportunity = makeSalesOpportunity({
        title: `Opportunity ${i}`,
        salesRepID: salesRep.id,
        clientID: client.id,
      });
      salesOpportunitiesRepo.items.push(salesOpportunity);
    }

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      salespersonID: "non-existing-id",
      page: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });
});
