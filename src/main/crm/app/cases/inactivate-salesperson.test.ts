import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { InactivateSalespersonUseCase } from "./inactivate-salesperson";
import { DomainEvents } from "@/core/events/domain-events";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

let salespersonsRepo: InMemoSalespersonsRepo;
let sut: InactivateSalespersonUseCase;

describe("Inactivate Salesperson", () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new InactivateSalespersonUseCase(salespersonsRepo);
    DomainEvents.clearHandlers();
  });

  it("should be able to inactivate a salesperson when the executor is a manager", async () => {
    const manager = makeSalesperson({
      role: SalespersonRole.manager,
    });
    salespersonsRepo.items.push(manager);

    const salesperson = makeSalesperson({});
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: manager.role, // ! Ensure the executor is a manager
      salespersonID: salesperson.id.toString(),
    });

    expect(result.isRight()).toBe(true);
  });

  it("should not be able to inactivate a non existing salesperson", async () => {
    const salesperson = makeSalesperson({
      role: SalespersonRole.manager, //! Ensure the role is 'manager'
    });

    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: salesperson.role,
      salespersonID: "non-existing-id", // ! Non-existing ID
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });

  it("should not be able to inactivate a salesperson if not the executor is not a manager", async () => {
    const nonManager = makeSalesperson({});
    salespersonsRepo.items.push(nonManager);

    const salesperson = makeSalesperson({});
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: salesperson.role, //! Not a manager
      salespersonID: salesperson.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
