import { EventHandler } from "@/core/events/event-handler";
import { DomainEvents } from "@/core/events/domain-events";
import { SalesOpportunityDeliveredEvent } from "../../enterprise/events/sales-opportunity-delivered-event";

export class OnDeliveredSalesOpportunityUpdated implements EventHandler {
  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.DeliveredSalesOpportunityUpdatedNotification.bind(this),
      SalesOpportunityDeliveredEvent.name
    );
  }

  private async DeliveredSalesOpportunityUpdatedNotification({
    salesOpportunity,
  }: SalesOpportunityDeliveredEvent) {
    console.log(
      `
      ===============================================
      ALERTA DE OPORTUNIDADE ENTREGUE!
      Oportunidade: ${salesOpportunity.title}
      Valor: ${salesOpportunity.value}
      Novo Status: ${salesOpportunity.status}
      ===============================================
      `
    );
  }
}
