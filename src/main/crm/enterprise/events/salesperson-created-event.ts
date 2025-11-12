import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';
import { Salesperson } from '../entities/salesperson';

export class SalesPersonEvent implements DomainEvent {
  public ocurredAt: Date;
  private readonly salesPerson: Salesperson;

  constructor(salesPerson: Salesperson) {
    this.ocurredAt = new Date();
    this.salesPerson = salesPerson;
  }

  getAggregateID(): UniqueEntityID {
    return this.salesPerson.id;
  }
}
