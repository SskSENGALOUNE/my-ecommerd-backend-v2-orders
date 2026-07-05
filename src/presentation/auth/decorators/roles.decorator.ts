import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../../domain/auth/user-role.enum";

export const ROLES_KEY = "roles";

/**
 * Restrict a route to the given roles. Must be combined with `JwtAuthGuard`
 * (which populates `request.user`) and `RolesGuard`, e.g.
 * `@UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
