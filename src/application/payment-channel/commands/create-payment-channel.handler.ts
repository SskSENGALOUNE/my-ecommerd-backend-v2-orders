import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CreatePaymentChannelCommand } from "./create-payment-channel.command";
import { PAYMENT_CHANNEL_REPOSITORY } from "../../../domain/payment-channel/payment-channel.repository";
import type { IPaymentChannelRepository } from "../../../domain/payment-channel/payment-channel.repository";
import { PaymentChannel } from "../../../domain/payment-channel/payment-channel.entity";

@CommandHandler(CreatePaymentChannelCommand)
export class CreatePaymentChannelHandler implements ICommandHandler<CreatePaymentChannelCommand> {
  constructor(
    @Inject(PAYMENT_CHANNEL_REPOSITORY)
    private readonly channels: IPaymentChannelRepository,
  ) {}

  execute(command: CreatePaymentChannelCommand): Promise<PaymentChannel> {
    const channel = PaymentChannel.create({
      bankName: command.bankName,
      qrImageUrl: command.qrImageUrl,
      accountName: command.accountName,
      accountNumber: command.accountNumber,
      sortOrder: command.sortOrder,
    });
    return this.channels.create(channel);
  }
}
