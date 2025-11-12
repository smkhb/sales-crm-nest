import { EventHandler } from "@/core/events/event-handler";
import { DomainEvents } from "@/core/events/domain-events";
import { SalesOpportunityHighValueEvent } from "../../enterprise/events/sales-opportunity-high-value-event";

export class OnHighValueSalesOpportunityUpdated implements EventHandler {
  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.HighValueSalesOpportunityUpdatedNotification.bind(this),
      SalesOpportunityHighValueEvent.name
    );
  }

  private async HighValueSalesOpportunityUpdatedNotification({
    salesOpportunity,
  }: SalesOpportunityHighValueEvent) {
    console.log(
      `
      ===============================================
      ALERTA DE ALTO VALOR PARA O GERENTE!
      Oportunidade: ${salesOpportunity.title}
      Valor: ${salesOpportunity.value}
      Novo Status: ${salesOpportunity.status}
      ===============================================
      `
    );
  }
}
