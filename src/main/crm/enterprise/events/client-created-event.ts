import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';
import { Client } from '../entities/client';

export class ClientCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  private readonly client: Client;

  constructor(client: Client) {
    this.ocurredAt = new Date();
    this.client = client;
  }

  getAggregateID(): UniqueEntityID {
    return this.client.id;
  }
}
