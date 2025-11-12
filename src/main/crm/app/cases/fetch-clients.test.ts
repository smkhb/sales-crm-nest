import { InMemoClientsRepo } from "tests/repos/in-memo-clients-repo";
import { DomainEvents } from "@/core/events/domain-events";
import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { makeClient } from "tests/factories/make-client";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { FetchClientsUseCase } from "./fetch-clients";

let clientsRepo: InMemoClientsRepo;
let salespersonsRepo: InMemoSalespersonsRepo;
let sut: FetchClientsUseCase;

describe("Fetch Clients By SalesRepID", () => {
  beforeEach(() => {
    clientsRepo = new InMemoClientsRepo();
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new FetchClientsUseCase(salespersonsRepo, clientsRepo);
    DomainEvents.clearHandlers();
  });

  it("should be able to fetch clients", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    for (let i = 1; i <= 5; i++) {
      clientsRepo.items.push(
        makeClient({
          name: `Test${i}`,
          email: `test${i}@example.com`,
          salesRepID: salesRep.id,
        })
      );
    }

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      salesRepID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      clients: expect.arrayContaining([
        expect.objectContaining({ name: "Test1" }),
        expect.objectContaining({ name: "Test2" }),
        expect.objectContaining({ name: "Test3" }),
        expect.objectContaining({ name: "Test4" }),
        expect.objectContaining({ name: "Test5" }),
      ]),
    });
  });

  it("should be able to fetch clients if the executor is the manager", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    for (let i = 1; i <= 5; i++) {
      clientsRepo.items.push(
        makeClient({
          name: `Test${i}`,
          email: `test${i}@example.com`,
          salesRepID: salesRep.id,
        })
      );
    }

    const result = await sut.execute({
      executorID: manager.id.toString(),
      salesRepID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      clients: [
        expect.objectContaining({ name: "Test1" }),
        expect.objectContaining({ name: "Test2" }),
        expect.objectContaining({ name: "Test3" }),
        expect.objectContaining({ name: "Test4" }),
        expect.objectContaining({ name: "Test5" }),
      ],
    });
  });

  it("should be able to fetch paginated clients", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    for (let i = 1; i <= 22; i++) {
      clientsRepo.items.push(
        makeClient({
          name: `Test${i}`,
          email: `test${i}@example.com`,
          salesRepID: salesRep.id,
        })
      );
    }

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      salesRepID: salesRep.id.toString(),
      page: 2,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      clients: [
        expect.objectContaining({ name: "Test21" }),
        expect.objectContaining({ name: "Test22" }),
      ],
    });
  });

  it("should not be able to fetch clients if using a non existing executorID", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({
      name: "Test",
      email: "test@example.com",
      salesRepID: salesRep.id,
    });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: "non-existing-executor-id",
      salesRepID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it("should not be able to get a client if the executor is not the Sales Representent or Manager", async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const randomSalesRep = makeSalesperson();
    salespersonsRepo.items.push(randomSalesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: randomSalesRep.id.toString(),
      salesRepID: salesRep.id.toString(),
      page: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
