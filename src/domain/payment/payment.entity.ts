import { randomUUID } from "crypto";
import { DomainValidationException } from "../exceptions";
import { BusinessRuleViolationException } from "../exceptions";
import {
  PaymentStatus,
  PAYMENT_STATUS_TRANSITIONS,
} from "./payment-status.enum";
import { PaymentMethod } from "./payment-method.enum";

export interface PaymentProps {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment entity for an order. The status only moves through allowed
 * transitions, and a transaction reference is captured when it completes.
 */
export class Payment {
  private constructor(private readonly props: PaymentProps) {}

  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get method(): PaymentMethod {
    return this.props.method;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get transactionRef(): string | null {
    return this.props.transactionRef;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
  }): Payment {
    if (!input.orderId?.trim()) {
      throw new DomainValidationException("Payment requires an orderId");
    }
    if (typeof input.amount !== "number" || input.amount <= 0) {
      throw new DomainValidationException(
        "Payment amount must be a positive number",
      );
    }
    const now = new Date();
    return new Payment({
      id: randomUUID(),
      orderId: input.orderId.trim(),
      amount: input.amount,
      method: input.method,
      status: PaymentStatus.PENDING,
      transactionRef: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PaymentProps): Payment {
    return new Payment({ ...props });
  }

  /** Mark the payment completed, capturing the gateway transaction reference. */
  complete(transactionRef: string): void {
    if (!transactionRef?.trim()) {
      throw new DomainValidationException(
        "A transactionRef is required to complete a payment",
      );
    }
    this.transitionTo(PaymentStatus.COMPLETED);
    this.props.transactionRef = transactionRef.trim();
  }

  fail(): void {
    this.transitionTo(PaymentStatus.FAILED);
  }

  refund(): void {
    this.transitionTo(PaymentStatus.REFUNDED);
  }

  private transitionTo(next: PaymentStatus): void {
    const allowed = PAYMENT_STATUS_TRANSITIONS[this.props.status];
    if (!allowed.includes(next)) {
      throw new BusinessRuleViolationException(
        `Cannot change payment status from ${this.props.status} to ${next}`,
        { from: this.props.status, to: next },
      );
    }
    this.props.status = next;
    this.props.updatedAt = new Date();
  }
}
