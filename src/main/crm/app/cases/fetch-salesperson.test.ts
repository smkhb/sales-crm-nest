import { DomainEvents } from '@/core/events/domain-events';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonRole } from '../../enterprise/entities/enum/salespersonRole';
import { FetchSalespersonUseCase } from './fetch-salesperson';

let salespersonsRepo: InMemoSalespersonsRepo;
let sut: FetchSalespersonUseCase;

describe('Fetch Salespersons', () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new FetchSalespersonUseCase(salespersonsRepo);
    DomainEvents.clearHandlers();
  });

  it("should be able to fetch a list of salesperson if the executor's a manager", async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    for (let i = 1; i <= 5; i++) {
      salespersonsRepo.items.push(
        makeSalesperson({
          name: `John Doe ${i}`,
          email: `johndoe${i}@example.com`,
        }),
      );
    }

    const result = await sut.execute({
      executorRole: manager.role,
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salespersons: expect.arrayContaining([
        expect.objectContaining({ name: 'John Doe 1' }),
        expect.objectContaining({ name: 'John Doe 2' }),
        expect.objectContaining({ name: 'John Doe 3' }),
        expect.objectContaining({ name: 'John Doe 4' }),
        expect.objectContaining({ name: 'John Doe 5' }),
      ]),
    });
  });

  it('should be able to fetch a paginated list of salesperson', async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    for (let i = 1; i <= 22; i++) {
      salespersonsRepo.items.push(
        makeSalesperson({
          name: `John Doe ${i}`,
          email: `johndoe${i}@example.com`,
        }),
      );
    }

    const result = await sut.execute({
      executorRole: manager.role,
      page: 2,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salespersons: expect.arrayContaining([
        expect.objectContaining({ name: 'John Doe 21' }),
        expect.objectContaining({ name: 'John Doe 22' }),
      ]),
    });
  });

  it('should not be able to fetch a list of salesperson if the executor is not a manager', async () => {
    const notAManager = makeSalesperson();
    salespersonsRepo.items.push(notAManager);

    for (let i = 1; i <= 5; i++) {
      salespersonsRepo.items.push(
        makeSalesperson({
          name: `John Doe ${i}`,
          email: `johndoe${i}@example.com`,
        }),
      );
    }

    const result = await sut.execute({
      executorRole: notAManager.role,
      page: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
