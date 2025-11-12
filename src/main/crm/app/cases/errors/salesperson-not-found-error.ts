import { UseCaseError } from "@/core/errors/use-case-error";

export class SalespersonNotFoundError extends Error implements UseCaseError {
  constructor() {
    super(`Salesperson not found`);
  }
}
