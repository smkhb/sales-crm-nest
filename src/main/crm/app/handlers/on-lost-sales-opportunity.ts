import { EventHandler } from "@/core/events/event-handler";
import { DomainEvents } from "@/core/events/domain-events";
import { SalesOpportunityLostEvent } from "../../enterprise/events/sales-opportunity-lost-event";

export class OnLostSalesOpportunityUpdated implements EventHandler {
  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.LostSalesOpportunityUpdatedNotification.bind(this),
      SalesOpportunityLostEvent.name
    );
  }

  private async LostSalesOpportunityUpdatedNotification({
    salesOpportunity,
  }: SalesOpportunityLostEvent) {
    console.log(
      `
      ===============================================
      ALERTA DE OPORTUNIDADE PERDIDA!
      Oportunidade: ${salesOpportunity.title}
      Valor: ${salesOpportunity.value}
      Novo Status: ${salesOpportunity.status}
      ===============================================
      `
    );
  }
}
