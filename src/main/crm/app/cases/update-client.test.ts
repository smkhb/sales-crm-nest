import { InMemoClientsRepo } from 'tests/repos/in-memo-clients-repo';
import { UpdateClientUseCase } from './update-client';
import { DomainEvents } from '@/core/events/domain-events';
import { ClientAlreadyExistsError } from './errors/client-already-exists-error';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { makeClient } from 'tests/factories/make-client';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { ClientNotFoundError } from './errors/client-not-found-error';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';

let clientsRepo: InMemoClientsRepo;
let salespersonsRepo: InMemoSalespersonsRepo;
let sut: UpdateClientUseCase;

describe('Update Client', () => {
  beforeEach(() => {
    clientsRepo = new InMemoClientsRepo();
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new UpdateClientUseCase(salespersonsRepo, clientsRepo);
    DomainEvents.clearHandlers();
  });

  it('should be able to update a client if the executor is the Sales Representent', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: client.salesRepID.toString(),
      clientID: client.id.toString(),
      name: 'New Name',
      email: 'new@example.com',
      phone: '11988888888',
      segment: 'New Segment',
      salesRepID: salesRep.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepo.items[0]).toEqual(
      expect.objectContaining({
        name: 'New Name',
        email: 'new@example.com',
      }),
    );
  });

  it('should be able to update a client if the executor is a Manager', async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id }); //! Client's sales rep is not the manager
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: manager.id.toString(),
      clientID: client.id.toString(),
      name: 'New Name',
      email: 'new@example.com',
      phone: '11988888888',
      segment: 'New Segment',
      salesRepID: salesRep.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(clientsRepo.items[0]).toEqual(
      expect.objectContaining({
        name: 'New Name',
        email: 'new@example.com',
      }),
    );
  });

  it('should not be able to update a client if the executor is not the Sales Representent or Manager', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const randomSalesRep = makeSalesperson();
    salespersonsRepo.items.push(randomSalesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: randomSalesRep.id.toString(),
      clientID: client.id.toString(),
      name: 'New Name',
      email: 'new@example.com',
      phone: '11988888888',
      segment: 'New Segment',
      salesRepID: salesRep.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should not be able to update a non existing client', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      clientID: 'non-existing-client-id',
      name: 'John Smith',
      email: 'johndoe@example.com',
      phone: '11988888888',
      segment: 'Enterprise',
      salesRepID: 'new-sales-rep-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClientNotFoundError);
  });

  it('should not be able to update a client email to an already registered client', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client1 = makeClient({
      salesRepID: salesRep.id,
      email: 'client1@example.com',
    });
    clientsRepo.items.push(client1);

    const client2 = makeClient({
      salesRepID: salesRep.id,
      email: 'client2@example.com',
    });
    clientsRepo.items.push(client2);

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      clientID: client1.id.toString(),
      name: 'John Smith',
      email: 'client2@example.com',
      phone: '11988888888',
      segment: 'Enterprise',
      salesRepID: salesRep.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClientAlreadyExistsError);
  });

  it('should not be able to update a client if the Sales Representent ID does not exists', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: salesRep.id.toString(),
      clientID: client.id.toString(),
      name: 'New Name',
      email: 'new@example.com',
      phone: '11988888888',
      segment: 'New Segment',
      salesRepID: 'non-existing-sales-rep-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it('should not be able to update a client if the executor does not exists', async () => {
    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const client = makeClient({ salesRepID: salesRep.id });
    clientsRepo.items.push(client);

    const result = await sut.execute({
      executorID: 'non-existing-executor-id',
      clientID: client.id.toString(),
      name: 'New Name',
      email: 'new@example.com',
      phone: '11988888888',
      segment: 'New Segment',
      salesRepID: salesRep.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });
});
