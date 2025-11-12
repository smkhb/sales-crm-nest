import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  SalesOpportunity,
  SalesOpportunityProps,
} from '@/main/crm/enterprise/entities/sales-opportunity';
import { faker } from '@faker-js/faker';

export function makeSalesOpportunity(
  override: Partial<SalesOpportunityProps> = {},
  id?: UniqueEntityID,
) {
  const salesOpportunity = SalesOpportunity.create(
    {
      creatorID: new UniqueEntityID(),
      clientID: new UniqueEntityID(),
      salesRepID: new UniqueEntityID(),
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      value: faker.number.int({ min: 1000, max: 10000 }),

      ...override,
    },
    id,
  );
  return salesOpportunity;
}
