import { randomUUID } from 'crypto';
import { DomainValidationException } from '../exceptions';
import { BusinessRuleViolationException } from '../exceptions';
import { OrderItem } from './order-item.entity';
import { OrderStatus, ORDER_STATUS_TRANSITIONS } from './order-status.enum';

export interface OrderProps {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/**
 * Order aggregate root. Owns its line items and guarantees that the total is
 * always the sum of the item subtotals, and that the status only moves through
 * the allowed fulfilment transitions.
 */
export class Order {
  private constructor(private readonly props: OrderProps) {}

  get id(): string {
    return this.props.id;
  }

  get orderNumber(): string {
    return this.props.orderNumber;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get shippingAddress(): string {
    return this.props.shippingAddress;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get totalAmount(): number {
    return this.props.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get updatedBy(): string {
    return this.props.updatedBy;
  }

  /** Create a brand-new order from a non-empty set of line items. */
  static create(input: {
    customerId: string;
    shippingAddress: string;
    items: Array<{
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
    }>;
    createdBy: string;
  }): Order {
    if (!input.customerId?.trim()) {
      throw new DomainValidationException('Order requires a customerId');
    }
    if (!input.shippingAddress?.trim()) {
      throw new DomainValidationException('Order requires a shippingAddress');
    }
    if (!input.items || input.items.length === 0) {
      throw new DomainValidationException(
        'Order must contain at least one item',
      );
    }

    const items = input.items.map((i) => OrderItem.create(i));
    const now = new Date();

    return new Order({
      id: randomUUID(),
      orderNumber: Order.generateOrderNumber(),
      customerId: input.customerId.trim(),
      status: OrderStatus.PENDING,
      shippingAddress: input.shippingAddress.trim(),
      items,
      createdAt: now,
      createdBy: input.createdBy,
      updatedAt: now,
      updatedBy: input.createdBy,
    });
  }

  static reconstitute(props: OrderProps): Order {
    return new Order({ ...props });
  }

  /** Move the order to a new status, enforcing the allowed transitions. */
  changeStatus(next: OrderStatus, updatedBy: string): void {
    const allowed = ORDER_STATUS_TRANSITIONS[this.props.status];
    if (!allowed.includes(next)) {
      throw new BusinessRuleViolationException(
        `Cannot change order status from ${this.props.status} to ${next}`,
        { from: this.props.status, to: next },
      );
    }
    this.props.status = next;
    this.touch(updatedBy);
  }

  /** Cancel the order if it has not yet shipped. */
  cancel(updatedBy: string): void {
    this.changeStatus(OrderStatus.CANCELLED, updatedBy);
  }

  updateShippingAddress(shippingAddress: string, updatedBy: string): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new BusinessRuleViolationException(
        'Shipping address can only be changed while the order is PENDING',
      );
    }
    const trimmed = shippingAddress?.trim() ?? '';
    if (trimmed.length === 0) {
      throw new DomainValidationException('shippingAddress must not be empty');
    }
    this.props.shippingAddress = trimmed;
    this.touch(updatedBy);
  }

  private touch(updatedBy: string): void {
    this.props.updatedBy = updatedBy;
    this.props.updatedAt = new Date();
  }

  private static generateOrderNumber(): string {
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = randomUUID().slice(0, 8).toUpperCase();
    return `ORD-${stamp}-${rand}`;
  }
}
