export * from "./create-payment-channel.command";
export * from "./create-payment-channel.handler";
export * from "./update-payment-channel.command";
export * from "./update-payment-channel.handler";
export * from "./delete-payment-channel.command";
export * from "./delete-payment-channel.handler";

import { CreatePaymentChannelHandler } from "./create-payment-channel.handler";
import { UpdatePaymentChannelHandler } from "./update-payment-channel.handler";
import { DeletePaymentChannelHandler } from "./delete-payment-channel.handler";

export const PaymentChannelCommandHandlers = [
  CreatePaymentChannelHandler,
  UpdatePaymentChannelHandler,
  DeletePaymentChannelHandler,
];
