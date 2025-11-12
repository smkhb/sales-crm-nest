import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { DomainEvents } from "@/core/events/domain-events";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { FakeHasher } from "tests/encryptography/fake-hasher";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";
import { UpdateSalespersonPasswordUseCase } from "./update-salesperson-password";

let salespersonsRepo: InMemoSalespersonsRepo;
let sut: UpdateSalespersonPasswordUseCase;
let fakeHasher: FakeHasher;

describe("Update Salesperson Password", () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new UpdateSalespersonPasswordUseCase(salespersonsRepo, fakeHasher);

    DomainEvents.clearHandlers();
  });

  it("should be able to update a salesperson password", async () => {
    const manager = makeSalesperson({
      email: "manager@example.com",
      passwordHash: await fakeHasher.hash("123456"),
      role: SalespersonRole.manager,
    });
    const salesperson = makeSalesperson({
      email: "salesperson@example.com",
      passwordHash: await fakeHasher.hash("123456"),
    });

    salespersonsRepo.items.push(manager);
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: manager.role,
      salespersonID: salesperson.id.toString(),
      newPassword: "new-password-123",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      salesperson: expect.objectContaining({
        props: expect.objectContaining({
          passwordHash: await fakeHasher.hash("new-password-123"),
        }),
      }),
    });
  });

  it("should not be able to update a non existing salesperson", async () => {
    const manager = makeSalesperson({
      email: "manager@example.com",
      passwordHash: await fakeHasher.hash("123456"),
      role: SalespersonRole.manager,
    });

    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorRole: manager.role,
      salespersonID: "non-existing-id",
      newPassword: "new-password-123",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it("should not be able to update a salesperson if not the executor is not a manager", async () => {
    const nonManager = makeSalesperson({
      email: "salesperson@example.com",
      passwordHash: await fakeHasher.hash("123456"),
    });
    const salesperson = makeSalesperson({
      email: "salesperson2@example.com",
      passwordHash: await fakeHasher.hash("123456"),
    });

    salespersonsRepo.items.push(nonManager);
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: nonManager.role,
      salespersonID: salesperson.id.toString(),
      newPassword: "new-password-123",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
