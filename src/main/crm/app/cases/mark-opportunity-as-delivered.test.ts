import { InMemoClientsRepo } from "tests/repos/in-memo-clients-repo";
import { InMemoSalesOpportunitiesRepo } from "tests/repos/in-memo-sales-opportunity-repo";
import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { DomainEvents } from "@/core/events/domain-events";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { makeClient } from "tests/factories/make-client";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { makeSalesOpportunity } from "tests/factories/make-sales-opportunity";
import { SalesOpportunityStatus } from "../../enterprise/entities/enum/salesOpportunityStatus";
import { SalesOpportunityNotFoundError } from "./errors/sales-opportunity-not-found-error";
import { MarkOpportunityAsDeliveredUseCase } from "./mark-opportunity-as-delivered";
import { SalesOpportunityWrongStatusError } from "../../enterprise/entities/errors/sales-opportunity-wrong-status-error";
import { SalesOpportunityPhotoURLRequiredError } from "../../enterprise/entities/errors/sales-opportunity-photo-required-error";
import { OnDeliveredSalesOpportunityUpdated } from "../handlers/on-delivered-sales-opportunity";

let salespersonsRepo: InMemoSalespersonsRepo;
let clientsRepo: InMemoClientsRepo;
let salesOpportunitiesRepo: InMemoSalesOpportunitiesRepo;
let sut: MarkOpportunityAsDeliveredUseCase;

describe("Mark Opportunity as Delivered", () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    clientsRepo = new InMemoClientsRepo();
    salesOpportunitiesRepo = new InMemoSalesOpportunitiesRepo();
    sut = new MarkOpportunityAsDeliveredUseCase(
      salespersonsRepo,
      salesOpportunitiesRepo
    );

    DomainEvents.clearHandlers();
    new OnDeliveredSalesOpportunityUpdated();
  });

  it("should be able to mark an opportunity as deliverd", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.won,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      photoURL: "http://example.com/delivery-photo.jpg",
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        status: SalesOpportunityStatus.delivered,
      })
    );
  });

  it("should be able to update a sales opportunity when the executor is a manager", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      creatorID: salesperson.id,
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.won,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      photoURL: "http://example.com/delivery-photo.jpg",
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        status: SalesOpportunityStatus.delivered,
      })
    );
  });

  it("should not be able to mark an opportunity as delivered when the executor does not exist", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      creatorID: salesperson.id,
      clientID: client.id,
      salesRepID: salesperson.id,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: "non-existing-salesperson-id",
      salesOpportunityID: salesOpportunity.id.toString(),
      photoURL: "http://example.com/delivery-photo.jpg",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it("should not be able to mark as delivered when the sales opportunity does not exist", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: "non-existing-sales-opportunity-id",
      photoURL: "http://example.com/delivery-photo.jpg",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalesOpportunityNotFoundError);
  });

  it("should not allow mark as deliverd when executor is neither the client's rep nor a manager", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.won,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const anotherSalesperson = makeSalesperson();
    salespersonsRepo.items.push(anotherSalesperson);

    const result = await sut.execute({
      executorID: anotherSalesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      photoURL: "http://example.com/delivery-photo.jpg",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to mark as delivered if the opportunity status is not 'won'", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.open,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      photoURL: "http://example.com/delivery-photo.jpg",
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalesOpportunityWrongStatusError);
  });

  it("should not be able to mark as delivered with an empty photoURL", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.won,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      photoURL: "",
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalesOpportunityPhotoURLRequiredError);
  });

  it.only("should trigger a domain event upon delivering a sales opportunity", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.won,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      photoURL: "http://example.com/delivery-photo.jpg",
    });

    expect(result.isRight()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
