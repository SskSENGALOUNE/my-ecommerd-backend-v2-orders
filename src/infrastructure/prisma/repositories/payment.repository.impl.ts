import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IPaymentRepository } from "../../../domain/payment/payment.repository";
import { Payment } from "../../../domain/payment/payment.entity";
import { PaymentMapper } from "../mappers/payment.mapper";

@Injectable()
export class PaymentRepositoryImpl implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: Payment): Promise<Payment> {
    const model = await this.prisma.payment.create({
      data: PaymentMapper.toCreateInput(entity),
    });
    return PaymentMapper.toDomain(model);
  }

  async findById(id: string): Promise<Payment | null> {
    const model = await this.prisma.payment.findUnique({ where: { id } });
    return model ? PaymentMapper.toDomain(model) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const model = await this.prisma.payment.findUnique({ where: { orderId } });
    return model ? PaymentMapper.toDomain(model) : null;
  }

  async save(entity: Payment): Promise<Payment> {
    const model = await this.prisma.payment.update({
      where: { id: entity.id },
      data: PaymentMapper.toUpdateInput(entity),
    });
    return PaymentMapper.toDomain(model);
  }
}
