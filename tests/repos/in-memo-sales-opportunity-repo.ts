import { SalesOpportunitiesRepo } from '@/main/crm/app/repos/salesOpportunities-repo';
import { SalesOpportunity } from '@/main/crm/enterprise/entities/sales-opportunity';

export class InMemoSalesOpportunitiesRepo implements SalesOpportunitiesRepo {
  public items: SalesOpportunity[] = [];

  async create(salesopportunity: SalesOpportunity) {
    this.items.push(salesopportunity);
  }

  async save(salesopportunity: SalesOpportunity) {
    const salesopportunityIndex = this.items.findIndex((item) =>
      item.id.equals(salesopportunity.id),
    );

    if (salesopportunityIndex < 0) {
      throw new Error('sales opportunity not found');
    }

    this.items[salesopportunityIndex] = salesopportunity;
  }

  async delete(salesopportunity: SalesOpportunity) {
    const salesopportunityIndex = this.items.findIndex((item) =>
      item.id.equals(salesopportunity.id),
    );

    this.items.splice(salesopportunityIndex, 1);
  }

  async findByID(id: string) {
    const salesopportunity = this.items.find(
      (item) => item.id.toString() === id,
    );

    if (!salesopportunity) {
      return null;
    }

    return salesopportunity;
  }

  async findMany(page: number) {
    const salesopportunities = this.items.slice((page - 1) * 20, page * 20);

    return salesopportunities;
  }

  async findManyBySalespersonID(id: string, page: number) {
    const salesopportunity = this.items
      .filter((item) => item.salesRepID.toString() === id)
      .slice((page - 1) * 20, page * 20);

    return salesopportunity;
  }
}
