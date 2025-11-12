import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AggregateRoot } from '@/core/entities/aggregate-root';
import { Optional } from '@/core/types/optional';
import { ClientCreatedEvent } from '../events/client-created-event';
import { ClientStatus } from './enum/clientStatus';

export interface ClientProps {
  creatorID: UniqueEntityID;
  name: string;
  email: string;
  phone: string;
  segment: string;
  status: ClientStatus;
  salesRepID: UniqueEntityID;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Client extends AggregateRoot<ClientProps> {
  get creatorID() {
    return this.props.creatorID;
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get phone() {
    return this.props.phone;
  }

  get segment() {
    return this.props.segment;
  }

  get status() {
    return this.props.status;
  }

  get salesRepID() {
    return this.props.salesRepID;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  public updateName(name: string) {
    this.props.name = name;
    this.touch();
  }

  public updateEmail(email: string) {
    this.props.email = email;
    this.touch();
  }

  public updatePhone(phone: string) {
    this.props.phone = phone;
    this.touch();
  }

  public active() {
    this.props.status = ClientStatus.active;
    this.touch();
  }

  public inactive() {
    this.props.status = ClientStatus.inactive;
    this.touch();
  }

  public updateSegment(segment: string) {
    this.props.segment = segment;
    this.touch();
  }

  public updateSalesRepID(salesRepID: UniqueEntityID) {
    this.props.salesRepID = salesRepID;
    this.touch();
  }

  static create(
    props: Optional<ClientProps, 'creatorID' | 'status' | 'createdAt'>,
    id?: UniqueEntityID,
  ): Client {
    const client = new Client(
      {
        ...props,
        creatorID: props.creatorID ?? props.salesRepID,
        status: props.status ?? ClientStatus.lead,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    const isNewClient = !id; // If no id is provided, it's a new client

    if (isNewClient) {
      client.addDomainEvent(new ClientCreatedEvent(client));
    }

    return client;
  }
}
