import { UserRole } from "../../../domain/auth/user-role.enum";

export class CancelOrderCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy: string,
    public readonly requesterRole: UserRole,
  ) {}
}
