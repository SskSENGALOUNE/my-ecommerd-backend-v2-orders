import { UserRole } from "../../../domain/auth/user-role.enum";

export class GetOrderByIdQuery {
  constructor(
    public readonly id: string,
    public readonly requesterId: string,
    public readonly requesterRole: UserRole,
  ) {}
}
