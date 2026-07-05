import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { DeletePaymentChannelCommand } from "./delete-payment-channel.command";
import { PAYMENT_CHANNEL_REPOSITORY } from "../../../domain/payment-channel/payment-channel.repository";
import type { IPaymentChannelRepository } from "../../../domain/payment-channel/payment-channel.repository";
import { NotFoundDomainException } from "../../../domain/exceptions";

@CommandHandler(DeletePaymentChannelCommand)
export class DeletePaymentChannelHandler implements ICommandHandler<DeletePaymentChannelCommand> {
  constructor(
    @Inject(PAYMENT_CHANNEL_REPOSITORY)
    private readonly channels: IPaymentChannelRepository,
  ) {}

  async execute(command: DeletePaymentChannelCommand): Promise<void> {
    const channel = await this.channels.findById(command.id);
    if (!channel) {
      throw NotFoundDomainException.forResource("PaymentChannel", command.id);
    }
    await this.channels.delete(command.id);
  }
}
