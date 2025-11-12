import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DomainEvent } from '@/core/events/domain-event';
import { SalesOpportunity } from '../entities/sales-opportunity';

export class SalesOpportunityHighValueEvent implements DomainEvent {
  public ocurredAt: Date;
  public salesOpportunity: SalesOpportunity;

  constructor(salesOpportunity: SalesOpportunity) {
    this.salesOpportunity = salesOpportunity;
    this.ocurredAt = new Date();
  }

  getAggregateID(): UniqueEntityID {
    return this.salesOpportunity.id;
  }
}
