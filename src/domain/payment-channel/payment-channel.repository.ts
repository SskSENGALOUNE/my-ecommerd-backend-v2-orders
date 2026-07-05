import { PaymentChannel } from "./payment-channel.entity";

/** Domain port for admin-managed payment channels. */
export interface IPaymentChannelRepository {
  create(entity: PaymentChannel): Promise<PaymentChannel>;
  findById(id: string): Promise<PaymentChannel | null>;
  /** All channels ordered by `sortOrder`; pass `onlyActive` for the customer view. */
  findAll(onlyActive?: boolean): Promise<PaymentChannel[]>;
  save(entity: PaymentChannel): Promise<PaymentChannel>;
  delete(id: string): Promise<void>;
}

export const PAYMENT_CHANNEL_REPOSITORY = Symbol("PAYMENT_CHANNEL_REPOSITORY");
