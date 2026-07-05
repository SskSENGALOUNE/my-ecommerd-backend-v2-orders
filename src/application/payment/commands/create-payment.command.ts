import { PaymentMethod } from "../../../domain/payment/payment-method.enum";
import { UserRole } from "../../../domain/auth/user-role.enum";

export class CreatePaymentCommand {
  constructor(
    public readonly orderId: string,
    public readonly method: PaymentMethod,
    public readonly requesterId: string,
    public readonly requesterRole: UserRole,
  ) {}
}
