import { UserRole } from "../../../domain/auth/user-role.enum";

export class GetPaymentByOrderQuery {
  constructor(
    public readonly orderId: string,
    public readonly requesterId: string,
    public readonly requesterRole: UserRole,
  ) {}
}
