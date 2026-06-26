import { Cart } from './cart.entity';

/**
 * Domain port for the Cart aggregate. Implementations persist the cart together
 * with its items.
 */
export interface ICartRepository {
  findById(id: string): Promise<Cart | null>;
  findByCustomerId(customerId: string): Promise<Cart | null>;
  save(entity: Cart): Promise<Cart>;
  delete(id: string): Promise<void>;
}

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');
