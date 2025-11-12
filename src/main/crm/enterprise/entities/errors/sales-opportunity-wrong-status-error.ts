import { UseCaseError } from "@/core/errors/use-case-error";

export class SalesOpportunityWrongStatusError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(`Sales opportunity has a wrong status for this operation`);
  }
}
