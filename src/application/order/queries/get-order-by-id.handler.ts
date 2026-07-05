import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetOrderByIdQuery } from "./get-order-by-id.query";
import type { IOrderRepository } from "../../../domain/order/order.repository";
import { ORDER_REPOSITORY } from "../../../domain/order/order.repository";
import { Order } from "../../../domain/order/order.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";
import { assertOwnerOrAdmin } from "../../common/authorization";

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<Order> {
    const result = await this.repository.findById(query.id);

    if (!result) {
      throw NotFoundDomainException.forResource("Order", query.id);
    }

    assertOwnerOrAdmin(result.customerId, query.requesterId, query.requesterRole);

    return result;
  }
}
