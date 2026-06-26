import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateOrderCommand } from './create-order.command';
import type { IOrderRepository } from '../../../domain/order/order.repository';
import { ORDER_REPOSITORY } from '../../../domain/order/order.repository';
import { Order } from '../../../domain/order/order.entity';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const order = Order.create({
      customerId: command.customerId,
      shippingAddress: command.shippingAddress,
      items: command.items,
      createdBy: command.createdBy,
    });

    return this.repository.create(order);
  }
}
