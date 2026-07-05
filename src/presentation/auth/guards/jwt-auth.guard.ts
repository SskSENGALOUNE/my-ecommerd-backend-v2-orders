import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { TOKEN_VERIFIER } from "../../../domain/auth/token-verifier";
import type {
  AccessTokenPayload,
  ITokenVerifier,
} from "../../../domain/auth/token-verifier";
import { UnauthorizedDomainException } from "../../../domain/exceptions";

/** Request augmented with the authenticated user's access-token claims. */
export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

/**
 * Verifies the `Authorization: Bearer <accessToken>` header (issued by
 * auth-service) and attaches the decoded claims to `request.user`. Depends only
 * on the domain token-verifier port.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_VERIFIER)
    private readonly tokens: ITokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedDomainException("Missing access token");
    }

    try {
      request.user = await this.tokens.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedDomainException("Invalid or expired access token");
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) {
      return null;
    }
    const [scheme, value] = header.split(" ");
    return scheme === "Bearer" && value ? value : null;
  }
}
