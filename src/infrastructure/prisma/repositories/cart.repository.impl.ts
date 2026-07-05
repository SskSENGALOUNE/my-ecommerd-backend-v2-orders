import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ICartRepository } from "../../../domain/cart/cart.repository";
import { Cart } from "../../../domain/cart/cart.entity";
import { CartMapper } from "../mappers/cart.mapper";

@Injectable()
export class CartRepositoryImpl implements ICartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Cart | null> {
    const model = await this.prisma.cart.findUnique({
      where: { id },
      include: { items: true },
    });
    return model ? CartMapper.toDomain(model) : null;
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    const model = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: true },
    });
    return model ? CartMapper.toDomain(model) : null;
  }

  /**
   * Persists the whole aggregate: upserts the cart, then replaces its items to
   * match the current in-memory state. Runs in a transaction so the cart and
   * its items never diverge.
   */
  async save(entity: Cart): Promise<Cart> {
    const model = await this.prisma.$transaction(async (tx) => {
      await tx.cart.upsert({
        where: { id: entity.id },
        create: { id: entity.id, customerId: entity.customerId },
        update: { customerId: entity.customerId },
      });

      await tx.cartItem.deleteMany({ where: { cartId: entity.id } });

      if (entity.items.length > 0) {
        await tx.cartItem.createMany({
          data: entity.items.map((item) => ({
            id: item.id,
            cartId: entity.id,
            productId: item.productId,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        });
      }

      return tx.cart.findUniqueOrThrow({
        where: { id: entity.id },
        include: { items: true },
      });
    });

    return CartMapper.toDomain(model);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cart.delete({ where: { id } });
  }
}
