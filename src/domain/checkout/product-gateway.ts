/** One line of a checkout to reserve against product-service. */
export interface ReserveItem {
  productId: string;
  quantity: number;
}

/** Authoritative product snapshot returned after a successful reservation. */
export interface ReservedProduct {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

/**
 * Domain port to product-service for checkout. `reserveStock` validates every
 * line (exists, active, enough stock) and decrements it, returning the
 * authoritative name + price to snapshot onto the order. It throws a domain
 * exception when any line is invalid, leaving no stock reserved.
 */
export interface IProductGateway {
  reserveStock(items: ReserveItem[]): Promise<ReservedProduct[]>;
}

export const PRODUCT_GATEWAY = Symbol("PRODUCT_GATEWAY");
