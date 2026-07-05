import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Prisma,
} from "@prisma/client";
import { Order } from "../../../domain/order/order.entity";
import { OrderItem } from "../../../domain/order/order-item.entity";
import { OrderStatus } from "../../../domain/order/order-status.enum";

type PrismaOrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

/**
 * Translates between the Prisma persistence model and the Order aggregate.
 * Keeps Prisma types out of the domain and application layers.
 */
export class OrderMapper {
  static toDomain(model: PrismaOrderWithItems): Order {
    return Order.reconstitute({
      id: model.id,
      orderNumber: model.orderNumber,
      customerId: model.customerId,
      status: model.status as OrderStatus,
      shippingAddress: model.shippingAddress,
      items: model.items.map((item) =>
        OrderItem.reconstitute({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        }),
      ),
      createdAt: model.createdAt,
      createdBy: model.createdBy,
      updatedAt: model.updatedAt,
      updatedBy: model.updatedBy,
    });
  }

  static toCreateInput(entity: Order): Prisma.OrderCreateInput {
    return {
      id: entity.id,
      orderNumber: entity.orderNumber,
      customerId: entity.customerId,
      status: entity.status,
      totalAmount: entity.totalAmount,
      shippingAddress: entity.shippingAddress,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      items: {
        create: entity.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      },
    };
  }

  /**
   * Update input for aggregate mutations that do not touch the line items
   * (status changes, shipping address, audit). Items are immutable after
   * creation in this service.
   */
  static toUpdateInput(entity: Order): Prisma.OrderUpdateInput {
    return {
      status: entity.status,
      totalAmount: entity.totalAmount,
      shippingAddress: entity.shippingAddress,
      updatedBy: entity.updatedBy,
    };
  }
}
