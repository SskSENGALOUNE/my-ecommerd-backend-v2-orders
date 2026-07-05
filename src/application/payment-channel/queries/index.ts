export * from "./get-payment-channels.query";
export * from "./get-payment-channels.handler";
export * from "./get-payment-channel-by-id.query";
export * from "./get-payment-channel-by-id.handler";

import { GetPaymentChannelsHandler } from "./get-payment-channels.handler";
import { GetPaymentChannelByIdHandler } from "./get-payment-channel-by-id.handler";

export const PaymentChannelQueryHandlers = [
  GetPaymentChannelsHandler,
  GetPaymentChannelByIdHandler,
];
