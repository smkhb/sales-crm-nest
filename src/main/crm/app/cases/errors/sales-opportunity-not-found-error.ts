import { UseCaseError } from '@/core/errors/use-case-error';

export class SalesOpportunityNotFoundError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(`Sales opportunity not found`);
  }
}
