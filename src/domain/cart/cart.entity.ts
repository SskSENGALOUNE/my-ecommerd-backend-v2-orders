import { randomUUID } from "crypto";
import { DomainValidationException } from "../exceptions";
import { CartItem } from "./cart-item.entity";

export interface CartProps {
  id: string;
  customerId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart aggregate root. Owns its items and keeps them unique per product: adding
 * a product that is already in the cart increases its quantity rather than
 * creating a duplicate line.
 */
export class Cart {
  private constructor(private readonly props: CartProps) {}

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): readonly CartItem[] {
    return this.props.items;
  }

  get totalAmount(): number {
    return this.props.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get totalItems(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Create a brand-new empty cart for a customer. */
  static create(input: { customerId: string }): Cart {
    if (!input.customerId?.trim()) {
      throw new DomainValidationException("Cart requires a customerId");
    }
    const now = new Date();
    return new Cart({
      id: randomUUID(),
      customerId: input.customerId.trim(),
      items: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CartProps): Cart {
    return new Cart({ ...props });
  }

  /** Add a product, merging quantities if it is already in the cart. */
  addItem(input: {
    productId: string;
    unitPrice: number;
    quantity: number;
  }): void {
    const existing = this.findItem(input.productId);
    if (existing) {
      existing.changeQuantity(existing.quantity + input.quantity);
      existing.changeUnitPrice(input.unitPrice);
    } else {
      this.props.items.push(CartItem.create(input));
    }
    this.touch();
  }

  /** Set the absolute quantity for a product already in the cart. */
  updateItemQuantity(productId: string, quantity: number): void {
    const item = this.requireItem(productId);
    item.changeQuantity(quantity);
    this.touch();
  }

  removeItem(productId: string): void {
    const idx = this.props.items.findIndex((i) => i.productId === productId);
    if (idx === -1) {
      throw new DomainValidationException(
        `Product ${productId} is not in the cart`,
      );
    }
    this.props.items.splice(idx, 1);
    this.touch();
  }

  clear(): void {
    this.props.items = [];
    this.touch();
  }

  private findItem(productId: string): CartItem | undefined {
    return this.props.items.find((i) => i.productId === productId);
  }

  private requireItem(productId: string): CartItem {
    const item = this.findItem(productId);
    if (!item) {
      throw new DomainValidationException(
        `Product ${productId} is not in the cart`,
      );
    }
    return item;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
