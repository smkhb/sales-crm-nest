import { EventHandler } from "@/core/events/event-handler";
import { DomainEvents } from "@/core/events/domain-events";
import { SalesOpportunityStatusUpdatedEvent } from "../../enterprise/events/sales-opportunity-status-updated-event";

export class OnSalesOpportunityStatusUpdated implements EventHandler {
  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.DeliveredSalesOpportunityUpdatedNotification.bind(this),
      SalesOpportunityStatusUpdatedEvent.name
    );
  }

  private async DeliveredSalesOpportunityUpdatedNotification({
    salesOpportunity,
  }: SalesOpportunityStatusUpdatedEvent) {
    console.log(
      `
      ===============================================
      ALERTA DE MUDANÇA DE STATUS NA OPORTUNIDADE!
      Oportunidade: ${salesOpportunity.title}
      Valor: ${salesOpportunity.value}
      Novo Status: ${salesOpportunity.status}
      ===============================================
      `
    );
  }
}
