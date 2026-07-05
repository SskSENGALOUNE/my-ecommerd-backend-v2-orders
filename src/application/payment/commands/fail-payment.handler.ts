import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { FailPaymentCommand } from "./fail-payment.command";
import type { IPaymentRepository } from "../../../domain/payment/payment.repository";
import { PAYMENT_REPOSITORY } from "../../../domain/payment/payment.repository";
import { Payment } from "../../../domain/payment/payment.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";

@CommandHandler(FailPaymentCommand)
export class FailPaymentHandler implements ICommandHandler<FailPaymentCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: FailPaymentCommand): Promise<Payment> {
    const payment = await this.paymentRepository.findByOrderId(command.orderId);
    if (!payment) {
      throw NotFoundDomainException.forResource(
        "Payment for order",
        command.orderId,
      );
    }

    payment.fail();

    return this.paymentRepository.save(payment);
  }
}
