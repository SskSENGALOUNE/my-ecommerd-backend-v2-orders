import { Order } from './order.entity';

/**
 * Domain port: speaks the Order aggregate only. Infrastructure adapters are
 * responsible for mapping to/from their own persistence shape (including the
 * order items).
 */
export interface IOrderRepository {
  create(entity: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findPaginated(params: OrderQueryParams): Promise<PaginatedResult<Order>>;
  save(entity: Order): Promise<Order>;
}

export interface OrderQueryParams {
  skip: number;
  take: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  customerId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
