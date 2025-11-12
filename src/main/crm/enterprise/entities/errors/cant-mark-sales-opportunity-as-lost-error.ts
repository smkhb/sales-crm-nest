import { UseCaseError } from '@/core/errors/use-case-error';

export class CantMarkSalesOpportunityAsLostError
  extends Error
  implements UseCaseError
{
  constructor(status: string) {
    super(
      `Cannot mark sales opportunity as lost when its status is '${status}'`,
    );
  }
}
