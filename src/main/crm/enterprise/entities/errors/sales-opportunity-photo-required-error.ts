import { UseCaseError } from "@/core/errors/use-case-error";

export class SalesOpportunityPhotoURLRequiredError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(`Photo URL is required to mark this sales opportunity as delivered`);
  }
}
