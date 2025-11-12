import { UseCaseError } from "@/core/errors/use-case-error";

export class SalespersonAlreadyExistsError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string) {
    super(`Salesperson with ${identifier} already exists`);
  }
}
