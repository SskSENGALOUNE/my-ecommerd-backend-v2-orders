import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateOrderStatusCommand } from './update-order-status.command';
import type { IOrderRepository } from '../../../domain/order/order.repository';
import { ORDER_REPOSITORY } from '../../../domain/order/order.repository';
import { Order } from '../../../domain/order/order.entity';
import { NotFoundDomainException } from '../../../domain/exceptions';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
  ) {}

  async execute(command: UpdateOrderStatusCommand): Promise<Order> {
    const order = await this.repository.findById(command.id);

    if (!order) {
      throw NotFoundDomainException.forResource('Order', command.id);
    }

    order.changeStatus(command.status, command.updatedBy);

    return this.repository.save(order);
  }
}
