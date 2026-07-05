import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetPaymentByOrderQuery } from "./get-payment-by-order.query";
import type { IPaymentRepository } from "../../../domain/payment/payment.repository";
import { PAYMENT_REPOSITORY } from "../../../domain/payment/payment.repository";
import type { IOrderRepository } from "../../../domain/order/order.repository";
import { ORDER_REPOSITORY } from "../../../domain/order/order.repository";
import { Payment } from "../../../domain/payment/payment.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";
import { assertOwnerOrAdmin } from "../../common/authorization";

@QueryHandler(GetPaymentByOrderQuery)
export class GetPaymentByOrderHandler implements IQueryHandler<GetPaymentByOrderQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly repository: IPaymentRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetPaymentByOrderQuery): Promise<Payment> {
    // Load the order first to enforce ownership (prevents reading another
    // customer's payment by guessing their order id).
    const order = await this.orderRepository.findById(query.orderId);
    if (!order) {
      throw NotFoundDomainException.forResource("Order", query.orderId);
    }
    assertOwnerOrAdmin(order.customerId, query.requesterId, query.requesterRole);

    const payment = await this.repository.findByOrderId(query.orderId);
    if (!payment) {
      throw NotFoundDomainException.forResource(
        "Payment for order",
        query.orderId,
      );
    }
    return payment;
  }
}
