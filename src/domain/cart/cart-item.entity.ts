import { randomUUID } from 'crypto';
import { DomainValidationException } from '../exceptions';

export interface CartItemProps {
  id: string;
  productId: string;
  unitPrice: number;
  quantity: number;
}

/** Child entity of the Cart aggregate. */
export class CartItem {
  private constructor(private readonly props: CartItemProps) {}

  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
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
    unitPrice: number;
    quantity: number;
  }): CartItem {
    if (!input.productId?.trim()) {
      throw new DomainValidationException('CartItem requires a productId');
    }
    if (typeof input.unitPrice !== 'number' || input.unitPrice < 0) {
      throw new DomainValidationException(
        'CartItem unitPrice must be a non-negative number',
      );
    }
    return new CartItem({
      id: randomUUID(),
      productId: input.productId.trim(),
      unitPrice: input.unitPrice,
      quantity: CartItem.validateQuantity(input.quantity),
    });
  }

  static reconstitute(props: CartItemProps): CartItem {
    return new CartItem({ ...props });
  }

  changeQuantity(quantity: number): void {
    this.props.quantity = CartItem.validateQuantity(quantity);
  }

  changeUnitPrice(unitPrice: number): void {
    if (typeof unitPrice !== 'number' || unitPrice < 0) {
      throw new DomainValidationException(
        'CartItem unitPrice must be a non-negative number',
      );
    }
    this.props.unitPrice = unitPrice;
  }

  private static validateQuantity(quantity: number): number {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new DomainValidationException(
        'CartItem quantity must be a positive integer',
      );
    }
    return quantity;
  }
}
