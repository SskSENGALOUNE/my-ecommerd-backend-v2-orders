import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetAllOrdersQuery } from "./get-all-orders.query";
import type { IOrderRepository } from "../../../domain/order/order.repository";
import { ORDER_REPOSITORY } from "../../../domain/order/order.repository";
import type { PaginatedResult } from "../../../domain/order/order.repository";
import type { Order } from "../../../domain/order/order.entity";

@QueryHandler(GetAllOrdersQuery)
export class GetAllOrdersHandler implements IQueryHandler<GetAllOrdersQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
  ) {}

  async execute(query: GetAllOrdersQuery): Promise<PaginatedResult<Order>> {
    return this.repository.findPaginated({
      skip: query.skip,
      take: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      customerId: query.customerId,
    });
  }
}
