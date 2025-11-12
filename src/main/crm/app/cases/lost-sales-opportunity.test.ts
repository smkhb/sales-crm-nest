import { InMemoClientsRepo } from 'tests/repos/in-memo-clients-repo';
import { InMemoSalesOpportunitiesRepo } from 'tests/repos/in-memo-sales-opportunity-repo';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { DomainEvents } from '@/core/events/domain-events';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { makeClient } from 'tests/factories/make-client';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { makeSalesOpportunity } from 'tests/factories/make-sales-opportunity';
import { SalesOpportunityStatus } from '../../enterprise/entities/enum/salesOpportunityStatus';
import { SalesOpportunityNotFoundError } from './errors/sales-opportunity-not-found-error';
import { LostSalesOpportunityUseCase } from './lost-sales-opportunity';
import { CantMarkSalesOpportunityAsLostError } from '../../enterprise/entities/errors/cant-mark-sales-opportunity-as-lost-error';
import { OnLostSalesOpportunityUpdated } from '../handlers/on-lost-sales-opportunity';

let salespersonsRepo: InMemoSalespersonsRepo;
let clientsRepo: InMemoClientsRepo;
let salesOpportunitiesRepo: InMemoSalesOpportunitiesRepo;
let sut: LostSalesOpportunityUseCase;

describe('Lost Sales Opportunity', () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    clientsRepo = new InMemoClientsRepo();
    salesOpportunitiesRepo = new InMemoSalesOpportunitiesRepo();
    sut = new LostSalesOpportunityUseCase(
      salespersonsRepo,
      salesOpportunitiesRepo,
    );

    DomainEvents.clearHandlers();

    new OnLostSalesOpportunityUpdated();
  });

  it('should be able to lost an opportunity', async () => {
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
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        status: SalesOpportunityStatus.lost,
      }),
    );
  });

  it('should be able to lost a sales opportunity when the executor is a manager', async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      creatorID: salesperson.id,
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.open,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        status: SalesOpportunityStatus.lost,
      }),
    );
  });

  it('should not be able to lost an opportunity when the executor does not exist', async () => {
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
      executorID: 'non-existing-salesperson-id',
      salesOpportunityID: salesOpportunity.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it('should not be able to lost a sale when the sales opportunity does not exist', async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: 'non-existing-sales-opportunity-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalesOpportunityNotFoundError);
  });

  it("should not allow mark as lost when executor is neither the client's rep nor a manager", async () => {
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
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to mark as lost if the opportunity status is 'won'", async () => {
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
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CantMarkSalesOpportunityAsLostError);
  });

  it("should not be able to mark as lost if the opportunity status is 'delivered'", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      status: SalesOpportunityStatus.delivered,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CantMarkSalesOpportunityAsLostError);
  });

  it.only('should trigger a domain event upon losting a sales opportunity', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
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
    });

    expect(result.isRight()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
