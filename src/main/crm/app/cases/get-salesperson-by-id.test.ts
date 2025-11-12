import { DomainEvents } from "@/core/events/domain-events";
import { InMemoSalespersonsRepo } from "tests/repos/in-memo-salespersons-repo";
import { makeSalesperson } from "tests/factories/make-salesperson";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";
import { SalespersonRole } from "../../enterprise/entities/enum/salespersonRole";
import { GetSalespersonByIDUseCase } from "./get-salesperson-by-id";

let salespersonsRepo: InMemoSalespersonsRepo;
let sut: GetSalespersonByIDUseCase;

describe("Get Salesperson by ID", () => {
  beforeEach(() => {
    salespersonsRepo = new InMemoSalespersonsRepo();
    sut = new GetSalespersonByIDUseCase(salespersonsRepo);
    DomainEvents.clearHandlers();
  });

  it("should be able to get a salesperon data the executor's a manager", async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const salesperson = makeSalesperson({
      name: "John Doe",
      email: "johndoe@example.com",
    });
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: manager.role,
      salespersonID: salesperson.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      salesperson: expect.objectContaining({
        name: "John Doe",
        email: "johndoe@example.com",
      }),
    });
  });

  it("should not be able to get a salesperson if the executor is not a manager", async () => {
    const notAManager = makeSalesperson();
    salespersonsRepo.items.push(notAManager);

    const salesRep = makeSalesperson();
    salespersonsRepo.items.push(salesRep);

    const salesperson = makeSalesperson();
    salespersonsRepo.items.push(salesperson);

    const result = await sut.execute({
      executorRole: notAManager.role,
      salespersonID: salesperson.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to get a non existing salesperson", async () => {
    const manager = makeSalesperson({ role: SalespersonRole.manager });
    salespersonsRepo.items.push(manager);

    const result = await sut.execute({
      executorRole: manager.role,
      salespersonID: "non-existing-salesperson-id",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SalespersonNotFoundError);
  });
});
