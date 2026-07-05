import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreatePaymentCommand } from "./create-payment.command";
import type { IPaymentRepository } from "../../../domain/payment/payment.repository";
import { PAYMENT_REPOSITORY } from "../../../domain/payment/payment.repository";
import type { IOrderRepository } from "../../../domain/order/order.repository";
import { ORDER_REPOSITORY } from "../../../domain/order/order.repository";
import { Payment } from "../../../domain/payment/payment.entity";
import {
  ConflictDomainException,
  NotFoundDomainException,
} from "../../../domain/exceptions";
import { assertOwnerOrAdmin } from "../../common/authorization";

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<Payment> {
    const order = await this.orderRepository.findById(command.orderId);
    if (!order) {
      throw NotFoundDomainException.forResource("Order", command.orderId);
    }

    assertOwnerOrAdmin(
      order.customerId,
      command.requesterId,
      command.requesterRole,
    );

    const existing = await this.paymentRepository.findByOrderId(
      command.orderId,
    );
    if (existing) {
      throw new ConflictDomainException(
        `A payment already exists for order ${command.orderId}`,
        { orderId: command.orderId },
      );
    }

    // Amount is always derived from the order total so the two can never drift.
    const payment = Payment.create({
      orderId: order.id,
      amount: order.totalAmount,
      method: command.method,
    });

    return this.paymentRepository.create(payment);
  }
}
