import { Client as DomainClient } from '@/main/crm/enterprise/entities/client';

export class ClientPresenter {
  static toHTTP(client: DomainClient) {
    return {
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
    };
  }
}
