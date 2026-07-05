import { Cart as PrismaCart, CartItem as PrismaCartItem } from "@prisma/client";
import { Cart } from "../../../domain/cart/cart.entity";
import { CartItem } from "../../../domain/cart/cart-item.entity";

type PrismaCartWithItems = PrismaCart & { items: PrismaCartItem[] };

/**
 * Translates between the Prisma persistence model and the Cart aggregate.
 */
export class CartMapper {
  static toDomain(model: PrismaCartWithItems): Cart {
    return Cart.reconstitute({
      id: model.id,
      customerId: model.customerId,
      items: model.items.map((item) =>
        CartItem.reconstitute({
          id: item.id,
          productId: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        }),
      ),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
