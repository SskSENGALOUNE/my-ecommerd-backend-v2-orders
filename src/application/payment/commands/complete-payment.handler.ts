import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CompletePaymentCommand } from './complete-payment.command';
import type { IPaymentRepository } from '../../../domain/payment/payment.repository';
import { PAYMENT_REPOSITORY } from '../../../domain/payment/payment.repository';
import type { IOrderRepository } from '../../../domain/order/order.repository';
import { ORDER_REPOSITORY } from '../../../domain/order/order.repository';
import { Payment } from '../../../domain/payment/payment.entity';
import { OrderStatus } from '../../../domain/order/order-status.enum';
import { NotFoundDomainException } from '../../../domain/exceptions';

@CommandHandler(CompletePaymentCommand)
export class CompletePaymentHandler
  implements ICommandHandler<CompletePaymentCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: CompletePaymentCommand): Promise<Payment> {
    const payment = await this.paymentRepository.findByOrderId(
      command.orderId,
    );
    if (!payment) {
      throw NotFoundDomainException.forResource(
        'Payment for order',
        command.orderId,
      );
    }

    payment.complete(command.transactionRef);
    const saved = await this.paymentRepository.save(payment);

    // Move the order forward to PAID once the payment succeeds.
    const order = await this.orderRepository.findById(command.orderId);
    if (order && order.status === OrderStatus.PENDING) {
      order.changeStatus(OrderStatus.PAID, command.updatedBy);
      await this.orderRepository.save(order);
    }

    return saved;
  }
}
