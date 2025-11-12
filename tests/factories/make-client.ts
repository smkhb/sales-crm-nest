import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Client, ClientProps } from '@/main/crm/enterprise/entities/client';
import { faker } from '@faker-js/faker';

export function makeClient(
  override: Partial<ClientProps> = {},
  id?: UniqueEntityID,
) {
  const client = Client.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      segment: faker.color.human(),
      salesRepID: new UniqueEntityID(),

      ...override,
    },
    id,
  );
  return client;
}
