import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CheckoutCommand } from "./checkout.command";
import { CART_REPOSITORY } from "../../../domain/cart/cart.repository";
import type { ICartRepository } from "../../../domain/cart/cart.repository";
import { ORDER_REPOSITORY } from "../../../domain/order/order.repository";
import type { IOrderRepository } from "../../../domain/order/order.repository";
import { PRODUCT_GATEWAY } from "../../../domain/checkout/product-gateway";
import type { IProductGateway } from "../../../domain/checkout/product-gateway";
import { Order } from "../../../domain/order/order.entity";
import { BusinessRuleViolationException } from "../../../domain/exceptions";

/**
 * Turns the customer's cart into an order:
 *   1. load the cart (must be non-empty)
 *   2. reserve stock at product-service (validates + decrements, returns the
 *      authoritative name + price — never trust the cart's cached price)
 *   3. create the order from those snapshots
 *   4. empty the cart
 *
 * Note: stock is decremented before the order row is written. An order-write
 * failure after a successful reservation would leak stock — acceptable
 * pre-MVP; a compensating release is future work (see PLAN Phase 3).
 */
@CommandHandler(CheckoutCommand)
export class CheckoutHandler implements ICommandHandler<CheckoutCommand> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly carts: ICartRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orders: IOrderRepository,
    @Inject(PRODUCT_GATEWAY)
    private readonly products: IProductGateway,
  ) {}

  async execute(command: CheckoutCommand): Promise<Order> {
    const cart = await this.carts.findByCustomerId(command.customerId);
    if (!cart || cart.items.length === 0) {
      throw new BusinessRuleViolationException("Your cart is empty");
    }

    const reserved = await this.products.reserveStock(
      cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );

    const order = Order.create({
      customerId: command.customerId,
      shippingAddress: command.shippingAddress,
      items: reserved.map((r) => ({
        productId: r.productId,
        productName: r.name,
        unitPrice: r.unitPrice,
        quantity: r.quantity,
      })),
      createdBy: command.customerId,
    });
    const created = await this.orders.create(order);

    cart.clear();
    await this.carts.save(cart);

    return created;
  }
}
