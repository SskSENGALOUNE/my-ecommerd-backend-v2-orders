import { Prisma, PaymentChannel as PrismaPaymentChannel } from "@prisma/client";
import { PaymentChannel } from "../../../domain/payment-channel/payment-channel.entity";

export class PaymentChannelMapper {
  static toDomain(model: PrismaPaymentChannel): PaymentChannel {
    return PaymentChannel.reconstitute({
      id: model.id,
      bankName: model.bankName,
      accountName: model.accountName,
      accountNumber: model.accountNumber,
      qrImageUrl: model.qrImageUrl,
      isActive: model.isActive,
      sortOrder: model.sortOrder,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toCreateInput(
    entity: PaymentChannel,
  ): Prisma.PaymentChannelCreateInput {
    return {
      id: entity.id,
      bankName: entity.bankName,
      accountName: entity.accountName,
      accountNumber: entity.accountNumber,
      qrImageUrl: entity.qrImageUrl,
      isActive: entity.isActive,
      sortOrder: entity.sortOrder,
    };
  }
}
