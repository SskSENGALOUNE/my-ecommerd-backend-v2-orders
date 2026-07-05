import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "../../../domain/auth/user-role.enum";
import {
  ForbiddenDomainException,
  UnauthorizedDomainException,
} from "../../../domain/exceptions";
import { AuthenticatedRequest } from "./jwt-auth.guard";

/**
 * Authorizes the request against the roles declared by `@Roles(...)`. Relies on
 * `JwtAuthGuard` having run first to attach the decoded claims to
 * `request.user`; routes with no `@Roles` metadata are left untouched.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedDomainException("Missing access token");
    }

    if (!required.includes(user.role)) {
      throw new ForbiddenDomainException(
        "You do not have permission to access this resource",
      );
    }

    return true;
  }
}
