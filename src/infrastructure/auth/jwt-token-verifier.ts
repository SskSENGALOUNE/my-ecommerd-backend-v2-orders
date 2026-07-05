import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  AccessTokenPayload,
  ITokenVerifier,
} from "../../domain/auth/token-verifier";
import { UserRole } from "../../domain/auth/user-role.enum";
import type { AppConfig } from "../../config/app.config";

/**
 * Verifies access tokens signed by auth-service using the shared
 * `JWT_ACCESS_SECRET`. Adapter for the `ITokenVerifier` domain port.
 */
@Injectable()
export class JwtTokenVerifier implements ITokenVerifier {
  private readonly accessSecret: string;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.accessSecret = config.get<AppConfig>("app")!.jwt.accessSecret;
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      email: string;
      role: UserRole;
    }>(token, { secret: this.accessSecret });
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
