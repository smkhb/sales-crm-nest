import { DomainEvents } from '@/core/events/domain-events';
import { FakeHasher } from 'tests/encryptography/fake-hasher';
import { InMemoSalespersonsRepo } from 'tests/repos/in-memo-salespersons-repo';
import { FakeEncrypter } from 'tests/encryptography/fake-encrypter';
import { AuthenticateSalespersonUseCase } from './authenticate-salesperson';
import { makeSalesperson } from 'tests/factories/make-salesperson';
import { WrongCredentialsError } from '@/core/errors/errors/wrong-credentials-error';
import { SalespersonNotFoundError } from './errors/salesperson-not-found-error';
import { SalespersonDeactiveError } from './errors/salesperson-deactive-error';

let salespersonsRepo: InMemoSalespersonsRepo;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateSalespersonUseCase;

describe('Authenticate Salesperson', () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    fakeHasher = new FakeHasher();
    fakeEncrypter = new FakeEncrypter();
    sut = new AuthenticateSalespersonUseCase(
      salespersonsRepo,
      fakeHasher,
      fakeEncrypter,
    );
    DomainEvents.clearHandlers();
  });

  it('should be able to authenticate a salesperson ', async () => {
    const salesperson = makeSalesperson({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    });

    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toHaveProperty('accessToken');
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('should not be able to authenticate a salesperson with the wrong password ', async () => {
    const salesperson = makeSalesperson({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    });

    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: 'wrong-password',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it('should not be able to authenticate a non existing salesperson', async () => {
    const salesperson = makeSalesperson({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
    });

    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      email: 'wrong@example.com',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it('should not be able to authenticate inactive salesperson', async () => {
    const salesperson = makeSalesperson({
      email: 'johndoe@example.com',
      passwordHash: await fakeHasher.hash('123456'),
      isActive: false,
    });

    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonDeactiveError);
  });
});
