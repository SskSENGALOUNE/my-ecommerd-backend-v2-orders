import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetPaymentChannelByIdQuery } from "./get-payment-channel-by-id.query";
import { PAYMENT_CHANNEL_REPOSITORY } from "../../../domain/payment-channel/payment-channel.repository";
import type { IPaymentChannelRepository } from "../../../domain/payment-channel/payment-channel.repository";
import { PaymentChannel } from "../../../domain/payment-channel/payment-channel.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";

@QueryHandler(GetPaymentChannelByIdQuery)
export class GetPaymentChannelByIdHandler implements IQueryHandler<GetPaymentChannelByIdQuery> {
  constructor(
    @Inject(PAYMENT_CHANNEL_REPOSITORY)
    private readonly channels: IPaymentChannelRepository,
  ) {}

  async execute(query: GetPaymentChannelByIdQuery): Promise<PaymentChannel> {
    const channel = await this.channels.findById(query.id);
    if (!channel) {
      throw NotFoundDomainException.forResource("PaymentChannel", query.id);
    }
    return channel;
  }
}
