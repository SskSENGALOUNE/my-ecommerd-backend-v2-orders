import { PaymentMethod } from '../../../domain/payment/payment-method.enum';

export class CreatePaymentCommand {
  constructor(
    public readonly orderId: string,
    public readonly method: PaymentMethod,
  ) {}
}
