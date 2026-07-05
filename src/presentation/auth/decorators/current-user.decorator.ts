import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AccessTokenPayload } from "../../../domain/auth/token-verifier";
import { AuthenticatedRequest } from "../guards/jwt-auth.guard";

/**
 * Injects the authenticated user's access-token claims (set by JwtAuthGuard).
 * Pass a property name to pick a single claim, e.g. `@CurrentUser('sub')`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
