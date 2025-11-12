import { UseCaseError } from '@/core/errors/use-case-error';

export class SalespersonDeactiveError extends Error implements UseCaseError {
  constructor() {
    super(`This account is not active account.`);
  }
}
