import { DomainEvents } from '@/core/events/domain-events';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { GetSalesOpportunityByIDUseCase } from './get-sales-opportunity-by-id';
import { InMemoSalesOpportunitiesRepo } from 'tests/repos/in-memo-sales-opportunity-repo';
import { makeSalesOpportunity } from 'tests/factories/make-sales-opportunity';
import { InMemoClientsRepo } from 'tests/repos/in-memo-clients-repo';
import { makeClient } from 'tests/factories/make-client';
import { SalesOpportunityNotFoundError } from './errors/sales-opportunity-not-found-error';

let salesOpportunitiesRepo: InMemoSalesOpportunitiesRepo;
let clientsRepo: InMemoClientsRepo;
let salespersonsRepo: InMemoSalespersonsRepo;
let sut: GetSalesOpportunityByIDUseCase;

describe('Get SalesOpportunity by ID', () => {
  beforeEach(() => {
    salesOpportunitiesRepo = new InMemoSalesOpportunitiesRepo();
    clientsRepo = new InMemoClientsRepo();
    salespersonsRepo = new InMemoSalespersonsRepo();

    sut = new GetSalesOpportunityByIDUseCase(
      salespersonsRepo,
      salesOpportunitiesRepo,
    );
    DomainEvents.clearHandlers();
  });

  it('should be able to get a salesOpportunity data by ID', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesRep.id,
    });

    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: salesOpportunity.salesRepID.toString(),
      salesOpportunityID: salesOpportunity.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salesOpportunity: expect.objectContaining({
        clientID: client.id,
        salesRepID: salesRep.id,
      }),
    });
  });

  it('should be able to get a salesOpportunity data if the executor is a manager', async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(manager, salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesRep.id,
    });

    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: manager.id.toString(), //! manager is the executor
      salesOpportunityID: salesOpportunity.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salesOpportunity: expect.objectContaining({
        clientID: client.id,
        salesRepID: salesRep.id,
      }),
    });
  });

  it('should not be able to get a salesOpportunity with a using a non existing executorID', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const salesOpportunity = makeSalesOpportunity({
      clientID: client.id,
      salesRepID: salesRep.id,
    });

    salesOpportunitiesRepo.items.push(salesOpportunity);

    const result = await sut.execute({
      executorID: 'non-existing-executor-id',
      salesOpportunityID: salesOpportunity.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it('should not be able to get a non existing salesOpportunity', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      salesOpportunityID: 'non-existing-salesopportunity-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalesOpportunityNotFoundError);
  });

  it('should not be able to get a salesOpportunity if the executor is not the Sales Representent or Manager', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const randomSalesRep = makeSalesperson();
    salespersonsRepo.items.push(randomSalesRep);

    const salesopportunity = makeSalesOpportunity({ salesRepID: salesRep.id });
    salesOpportunitiesRepo.items.push(salesopportunity);

    const result = await sut.execute({
      executorID: randomSalesRep.id.toString(),
      salesOpportunityID: salesopportunity.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
