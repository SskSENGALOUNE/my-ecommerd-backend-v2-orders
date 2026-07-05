import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetCartByCustomerQuery } from "./get-cart-by-customer.query";
import type { ICartRepository } from "../../../domain/cart/cart.repository";
import { CART_REPOSITORY } from "../../../domain/cart/cart.repository";
import { Cart } from "../../../domain/cart/cart.entity";

@QueryHandler(GetCartByCustomerQuery)
export class GetCartByCustomerHandler implements IQueryHandler<GetCartByCustomerQuery> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly repository: ICartRepository,
  ) {}

  /**
   * Returns the customer's cart, or a fresh empty (unsaved) cart if none exists
   * yet — reading a cart should never 404 for a valid customer.
   */
  async execute(query: GetCartByCustomerQuery): Promise<Cart> {
    const cart = await this.repository.findByCustomerId(query.customerId);
    return cart ?? Cart.create({ customerId: query.customerId });
  }
}
