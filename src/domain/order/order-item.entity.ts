import { randomUUID } from "crypto";
import { DomainValidationException } from "../exceptions";

export interface OrderItemProps {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

/**
 * Child entity of the Order aggregate. Its subtotal is derived, never set
 * directly, so it can never drift from unitPrice × quantity.
 */
export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get subtotal(): number {
    return this.props.unitPrice * this.props.quantity;
  }

  static create(input: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
  }): OrderItem {
    if (!input.productId?.trim()) {
      throw new DomainValidationException("OrderItem requires a productId");
    }
    if (!input.productName?.trim()) {
      throw new DomainValidationException("OrderItem requires a productName");
    }
    if (typeof input.unitPrice !== "number" || input.unitPrice < 0) {
      throw new DomainValidationException(
        "OrderItem unitPrice must be a non-negative number",
      );
    }
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new DomainValidationException(
        "OrderItem quantity must be a positive integer",
      );
    }

    return new OrderItem({
      id: randomUUID(),
      productId: input.productId.trim(),
      productName: input.productName.trim(),
      unitPrice: input.unitPrice,
      quantity: input.quantity,
    });
  }

  static reconstitute(props: OrderItemProps): OrderItem {
    return new OrderItem({ ...props });
  }
}
