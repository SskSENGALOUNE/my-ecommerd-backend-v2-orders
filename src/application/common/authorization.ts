import { UserRole } from "../../domain/auth/user-role.enum";
import { ForbiddenDomainException } from "../../domain/exceptions";

/** Admins (ADMIN / SUPER_ADMIN) may act on any customer's resources. */
export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

/**
 * Enforce that the requester either owns the resource or is an admin. Prevents
 * IDOR: a logged-in customer must not read/act on another customer's order or
 * payment by guessing its id.
 */
export function assertOwnerOrAdmin(
  ownerId: string,
  requesterId: string,
  requesterRole: UserRole,
): void {
  if (!isAdminRole(requesterRole) && ownerId !== requesterId) {
    throw new ForbiddenDomainException(
      "You do not have permission to access this resource",
    );
  }
}
