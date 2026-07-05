import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetPaymentChannelsQuery } from "./get-payment-channels.query";
import { PAYMENT_CHANNEL_REPOSITORY } from "../../../domain/payment-channel/payment-channel.repository";
import type { IPaymentChannelRepository } from "../../../domain/payment-channel/payment-channel.repository";
import { PaymentChannel } from "../../../domain/payment-channel/payment-channel.entity";

@QueryHandler(GetPaymentChannelsQuery)
export class GetPaymentChannelsHandler implements IQueryHandler<GetPaymentChannelsQuery> {
  constructor(
    @Inject(PAYMENT_CHANNEL_REPOSITORY)
    private readonly channels: IPaymentChannelRepository,
  ) {}

  execute(query: GetPaymentChannelsQuery): Promise<PaymentChannel[]> {
    return this.channels.findAll(query.onlyActive);
  }
}
