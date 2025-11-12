import { SalespersonsRepo } from "@/main/crm/app/repos/salespersons-repo";
import { Salesperson } from "@/main/crm/enterprise/entities/salesperson";

export class InMemoSalespersonsRepo implements SalespersonsRepo {
  public items: Salesperson[] = [];

  async create(salesperson: Salesperson) {
    this.items.push(salesperson);
  }

  async save(salesperson: Salesperson) {
    const salespersonIndex = this.items.findIndex((item) =>
      item.id.equals(salesperson.id)
    );

    if (salespersonIndex < 0) {
      throw new Error("salesperson not found"); // TODO: create a specific error
    }

    this.items[salespersonIndex] = salesperson;
  }

  async delete(salesperson: Salesperson) {
    const salespersonIndex = this.items.findIndex((item) =>
      item.id.equals(salesperson.id)
    );

    this.items.splice(salespersonIndex, 1);
  }

  async findByID(id: string) {
    const salesperson = this.items.find((item) => item.id.toString() === id);

    if (!salesperson) {
      return null;
    }

    return salesperson;
  }

  async findByEmail(email: string) {
    const salesperson = this.items.find((item) => item.email === email);

    if (!salesperson) {
      return null;
    }

    return salesperson;
  }

  async findMany(page: number) {
    const clients = this.items.slice((page - 1) * 20, page * 20); // assuming 20 items per page

    return clients;
  }
}
