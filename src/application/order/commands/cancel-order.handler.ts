import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CancelOrderCommand } from "./cancel-order.command";
import type { IOrderRepository } from "../../../domain/order/order.repository";
import { ORDER_REPOSITORY } from "../../../domain/order/order.repository";
import { Order } from "../../../domain/order/order.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
  ) {}

  async execute(command: CancelOrderCommand): Promise<Order> {
    const order = await this.repository.findById(command.id);

    if (!order) {
      throw NotFoundDomainException.forResource("Order", command.id);
    }

    order.cancel(command.updatedBy);

    return this.repository.save(order);
  }
}
