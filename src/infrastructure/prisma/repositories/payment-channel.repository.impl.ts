import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IPaymentChannelRepository } from "../../../domain/payment-channel/payment-channel.repository";
import { PaymentChannel } from "../../../domain/payment-channel/payment-channel.entity";
import { PaymentChannelMapper } from "../mappers/payment-channel.mapper";

@Injectable()
export class PaymentChannelRepositoryImpl implements IPaymentChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: PaymentChannel): Promise<PaymentChannel> {
    const model = await this.prisma.paymentChannel.create({
      data: PaymentChannelMapper.toCreateInput(entity),
    });
    return PaymentChannelMapper.toDomain(model);
  }

  async findById(id: string): Promise<PaymentChannel | null> {
    const model = await this.prisma.paymentChannel.findUnique({
      where: { id },
    });
    return model ? PaymentChannelMapper.toDomain(model) : null;
  }

  async findAll(onlyActive = false): Promise<PaymentChannel[]> {
    const models = await this.prisma.paymentChannel.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return models.map((m) => PaymentChannelMapper.toDomain(m));
  }

  async save(entity: PaymentChannel): Promise<PaymentChannel> {
    const model = await this.prisma.paymentChannel.update({
      where: { id: entity.id },
      data: {
        bankName: entity.bankName,
        accountName: entity.accountName,
        accountNumber: entity.accountNumber,
        qrImageUrl: entity.qrImageUrl,
        isActive: entity.isActive,
        sortOrder: entity.sortOrder,
      },
    });
    return PaymentChannelMapper.toDomain(model);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.paymentChannel.delete({ where: { id } });
  }
}
