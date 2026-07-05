import { Payment as PrismaPayment, Prisma } from "@prisma/client";
import { Payment } from "../../../domain/payment/payment.entity";
import { PaymentStatus } from "../../../domain/payment/payment-status.enum";
import { PaymentMethod } from "../../../domain/payment/payment-method.enum";

/**
 * Translates between the Prisma persistence model and the Payment entity.
 */
export class PaymentMapper {
  static toDomain(model: PrismaPayment): Payment {
    return Payment.reconstitute({
      id: model.id,
      orderId: model.orderId,
      amount: model.amount,
      method: model.method as PaymentMethod,
      status: model.status as PaymentStatus,
      transactionRef: model.transactionRef,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toCreateInput(entity: Payment): Prisma.PaymentCreateInput {
    return {
      id: entity.id,
      order: { connect: { id: entity.orderId } },
      amount: entity.amount,
      method: entity.method,
      status: entity.status,
      transactionRef: entity.transactionRef,
    };
  }

  static toUpdateInput(entity: Payment): Prisma.PaymentUpdateInput {
    return {
      status: entity.status,
      transactionRef: entity.transactionRef,
    };
  }
}
