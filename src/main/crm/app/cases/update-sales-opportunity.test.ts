import { InMemoClientsRepo } from 'tests/repos/in-memo-clients-repo';
import { InMemoSalesOpportunitiesRepo } from 'tests/repos/in-memo-sales-opportunity-repo';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { UpdateSalesOpportunityUseCase } from './update-sales-opportunity';
import { DomainEvents } from '@/core/events/domain-events';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { makeClient } from 'tests/factories/make-client';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { makeSalesOpportunity } from 'tests/factories/make-sales-opportunity';
import { SalesOpportunityStatus } from '../../enterprise/entities/enum/salesOpportunityStatus';
import { SalesOpportunityNotFoundError } from './errors/sales-opportunity-not-found-error';
import { OnHighValueSalesOpportunityUpdated } from '../handlers/on-high-value-sales-opportunity-updated';
import { OnSalesOpportunityStatusUpdated } from '../handlers/on-opportunity-status-updated';

let salespersonsRepo: InMemoSalespersonsRepo;
let clientsRepo: InMemoClientsRepo;
let salesOpportunitiesRepo: InMemoSalesOpportunitiesRepo;
let sut: UpdateSalesOpportunityUseCase;

describe('Update Sales Opportunity', () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    clientsRepo = new InMemoClientsRepo();
    salesOpportunitiesRepo = new InMemoSalesOpportunitiesRepo();
    sut = new UpdateSalesOpportunityUseCase(
      salespersonsRepo,
      salesOpportunitiesRepo,
    );

    DomainEvents.clearHandlers();
    new OnHighValueSalesOpportunityUpdated();
    new OnSalesOpportunityStatusUpdated();
  });

  it('should be able to update a sales opportunity', async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      title: 'Updated Sales Opportunity',
      description: 'This is an updated sales opportunity.',
      value: 5000,
      status: salesOpportunity.status,
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        title: 'Updated Sales Opportunity',
        description: 'This is an updated sales opportunity.',
        value: 5000,
      }),
    );
  });

  it('should be able to update a sales opportunity when the executor is a manager', async () => {
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

    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      title: 'Updated Sales Opportunity by Manager',
      description: 'This is an updated sales opportunity by Manager.',
      value: 5000,
      status: salesOpportunity.status,
    });

    expect(result.isRight()).toBe(true);
    expect(salesOpportunitiesRepo.items[0]).toEqual(
      expect.objectContaining({
        title: 'Updated Sales Opportunity by Manager',
        description: 'This is an updated sales opportunity by Manager.',
        value: 5000,
      }),
    );
  });

  it('should not be able to update a new sales opportunity when the executor does not exist', async () => {
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
      executorID: 'non-existing-executor-id',
      salesOpportunityID: salesOpportunity.id.toString(),
      title: 'Updated Sales Opportunity by Manager',
      description: 'This is an updated sales opportunity by Manager.',
      value: 5000,
      status: salesOpportunity.status,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it('should not be able to update a new sales opportunity when the sales opportunity does not exist', async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: 'non-existing-sales-opportunity-id',
      title: 'Updated Sales Opportunity',
      description: 'This is an updated sales opportunity.',
      value: 5000,
      status: SalesOpportunityStatus.lost,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalesOpportunityNotFoundError);
  });

  it("should not allow updateing when executor is neither the client's rep nor a manager", async () => {
    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const anotherSalesperson = makeSalesperson();
    salespersonsRepo.items.push(anotherSalesperson);

    const result = await sut.execute({
      executorID: anotherSalesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      title: 'Updated Sales Opportunity',
      description: 'This is an updated sales opportunity.',
      value: 5000,
      status: salesOpportunity.status,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should trigger a domain event upon updating status from a sales opportunity', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      title: 'Updated Sales Opportunity',
      description: 'This is an updated sales opportunity.',
      value: 5000,
      status: SalesOpportunityStatus.inProgress,
    });

    expect(result.isRight()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should trigger a domain event upon updating a opportunity to a high value', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      value: 100,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      title: 'Updated Sales Opportunity',
      description: 'This is an updated sales opportunity.',
      value: 10000,
      status: salesOpportunity.status,
    });

    expect(result.isRight()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should trigger a domain event upon updating status and high value from a sales opportunity', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const client = makeClient({ salesRepID: salesperson.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesperson.id,
      value: 400,
    });
    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesperson.id.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
      title: 'Updated Sales Opportunity',
      description: 'This is an updated sales opportunity.',
      value: 10000,
      status: SalesOpportunityStatus.inProgress,
    });

    expect(result.isRight()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
