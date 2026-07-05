import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { UpdatePaymentChannelCommand } from "./update-payment-channel.command";
import { PAYMENT_CHANNEL_REPOSITORY } from "../../../domain/payment-channel/payment-channel.repository";
import type { IPaymentChannelRepository } from "../../../domain/payment-channel/payment-channel.repository";
import { PaymentChannel } from "../../../domain/payment-channel/payment-channel.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";

@CommandHandler(UpdatePaymentChannelCommand)
export class UpdatePaymentChannelHandler implements ICommandHandler<UpdatePaymentChannelCommand> {
  constructor(
    @Inject(PAYMENT_CHANNEL_REPOSITORY)
    private readonly channels: IPaymentChannelRepository,
  ) {}

  async execute(command: UpdatePaymentChannelCommand): Promise<PaymentChannel> {
    const channel = await this.channels.findById(command.id);
    if (!channel) {
      throw NotFoundDomainException.forResource("PaymentChannel", command.id);
    }

    channel.update({
      bankName: command.bankName,
      qrImageUrl: command.qrImageUrl,
      accountName: command.accountName,
      accountNumber: command.accountNumber,
      isActive: command.isActive,
      sortOrder: command.sortOrder,
    });
    return this.channels.save(channel);
  }
}
