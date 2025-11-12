import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { SalesOpportunityStatus as OpportunityStatus } from "./enum/salesOpportunityStatus";
import { AggregateRoot } from "@/core/entities/aggregate-root";
import { Optional } from "@/core/types/optional";
import { SalesOpportunityCreatedEvent } from "../events/sales-opportunity-created-event";
import { SalesOpportunityWrongStatusError } from "./errors/sales-opportunity-wrong-status-error";
import { SalesOpportunityPhotoURLRequiredError } from "./errors/sales-opportunity-photo-required-error";
import { Either, left, right } from "@/core/either";
import { CantMarkSalesOpportunityAsLostError } from "./errors/cant-mark-sales-opportunity-as-lost-error";
import { SalesOpportunityHighValueEvent } from "../events/sales-opportunity-high-value-event";
import { SalesOpportunityStatusUpdatedEvent } from "../events/sales-opportunity-status-updated-event";
import { SalesOpportunityLostEvent } from "../events/sales-opportunity-lost-event";
import { SalesOpportunityDeliveredEvent } from "../events/sales-opportunity-delivered-event";

export interface SalesOpportunityProps {
  creatorID: UniqueEntityID;
  clientID: UniqueEntityID;
  salesRepID: UniqueEntityID;
  title: string;
  description: string;
  value: number;
  status: OpportunityStatus;
  deliveryPhotoURL?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class SalesOpportunity extends AggregateRoot<SalesOpportunityProps> {
  get creatorID() {
    return this.props.creatorID;
  }

  get clientID() {
    return this.props.clientID;
  }

  get salesRepID() {
    return this.props.salesRepID;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get value() {
    return this.props.value;
  }

  get status() {
    return this.props.status;
  }

  get deliveryPhotoURL() {
    return this.props.deliveryPhotoURL;
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

  public updateTitle(title: string) {
    this.props.title = title;
    this.touch();
  }

  public updateDescription(description: string) {
    this.props.description = description;
    this.touch();
  }

  public updateValue(value: number) {
    if (value !== this.props.value && value >= 10000) {
      this.addDomainEvent(new SalesOpportunityHighValueEvent(this));
    }
    this.props.value = value;
    this.touch();
  }

  public updateStatus(status: OpportunityStatus) {
    if (status !== this.props.status) {
      this.addDomainEvent(new SalesOpportunityStatusUpdatedEvent(this));
    }
    this.props.status = status;
    this.touch();
  }

  public markAsLost(): Either<CantMarkSalesOpportunityAsLostError, true> {
    if (
      this.props.status !== OpportunityStatus.inProgress &&
      this.props.status !== OpportunityStatus.open
    ) {
      return left(
        new CantMarkSalesOpportunityAsLostError(this.props.status.toString())
      );
    }

    this.props.status = OpportunityStatus.lost;
    this.touch();

    this.addDomainEvent(new SalesOpportunityLostEvent(this));

    return right(true);
  }

  public markAsDelivered(
    photoURL: string
  ): Either<
    SalesOpportunityPhotoURLRequiredError | SalesOpportunityWrongStatusError,
    true
  > {
    if (this.props.status !== OpportunityStatus.won) {
      return left(new SalesOpportunityWrongStatusError());
    }
    if (!photoURL) {
      return left(new SalesOpportunityPhotoURLRequiredError());
    }

    this.props.status = OpportunityStatus.delivered;
    this.props.deliveryPhotoURL = photoURL;
    this.touch();

    this.addDomainEvent(new SalesOpportunityDeliveredEvent(this));

    return right(true);
  }

  static create(
    props: Optional<SalesOpportunityProps, "status" | "createdAt">,
    id?: UniqueEntityID
  ) {
    const salesOpportunity = new SalesOpportunity(
      {
        ...props,
        status: props.status ?? OpportunityStatus.open,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
    const isNewSalesOpportunity = !id;

    if (isNewSalesOpportunity) {
      salesOpportunity.addDomainEvent(
        new SalesOpportunityCreatedEvent(salesOpportunity)
      );
    }

    return salesOpportunity;
  }
}
