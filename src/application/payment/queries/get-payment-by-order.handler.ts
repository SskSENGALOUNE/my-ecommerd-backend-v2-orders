import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetPaymentByOrderQuery } from "./get-payment-by-order.query";
import type { IPaymentRepository } from "../../../domain/payment/payment.repository";
import { PAYMENT_REPOSITORY } from "../../../domain/payment/payment.repository";
import { Payment } from "../../../domain/payment/payment.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";

@QueryHandler(GetPaymentByOrderQuery)
export class GetPaymentByOrderHandler implements IQueryHandler<GetPaymentByOrderQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly repository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentByOrderQuery): Promise<Payment> {
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
