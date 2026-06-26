import { OrderStatus } from '../../../domain/order/order-status.enum';

export class UpdateOrderStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: OrderStatus,
    public readonly updatedBy: string,
  ) {}
}
