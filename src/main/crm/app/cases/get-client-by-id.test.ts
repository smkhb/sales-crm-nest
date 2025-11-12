import { InMemoClientsRepo } from 'tests/repos/in-memo-clients-repo';
import { DomainEvents } from '@/core/events/domain-events';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { makeClient } from 'tests/factories/make-client';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { ClientNotFoundError } from './errors/client-not-found-error';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { GetClientByIDUseCase } from './get-client-by-id';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';

let clientsRepo: InMemoClientsRepo;
let salespersonsRepo: InMemoSalespersonsRepo;
let sut: GetClientByIDUseCase;

describe('Get Client by ID', () => {
  beforeEach(() => {
    clientsRepo = new InMemoClientsRepo();
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new GetClientByIDUseCase(salespersonsRepo, clientsRepo);
    DomainEvents.clearHandlers();
  });

  it('should be able to get a client data by ID', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({
      name: 'Test',
      email: 'test@example.com',
      salesRepID: salesRep.id,
    });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: client.salesRepID.toString(),
      clientID: client.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      client: expect.objectContaining({
        name: 'Test',
        email: 'test@example.com',
      }),
    });
  });

  it('should not be able to get a client with a using a non existing executorID', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({
      name: 'Test',
      email: 'test@example.com',
      salesRepID: salesRep.id,
    });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: 'non-existing-executor-id',
      clientID: client.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it('should not be able to get a non existing client', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      clientID: 'non-existing-client-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClientNotFoundError);
  });

  it('should not be able to get a client if the executor is not the Sales Representent or Manager', async () => {
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

  it('should be able to get a client data if the executor is a manager', async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(manager, salesRep);

    const client = makeClient({
      name: 'Test',
      email: 'test@example.com',
      salesRepID: salesRep.id,
    });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: manager.id.toString(), //! manager is the executor
      clientID: client.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      client: expect.objectContaining({
        name: 'Test',
        email: 'test@example.com',
      }),
    });
  });
});
