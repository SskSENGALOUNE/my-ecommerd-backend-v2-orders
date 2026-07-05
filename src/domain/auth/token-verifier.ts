import { UserRole } from "./user-role.enum";

/** Claims carried by a short-lived access token issued by auth-service. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/**
 * Domain port for verifying access tokens minted by auth-service. Implemented in
 * infrastructure with `@nestjs/jwt`, using the shared `JWT_ACCESS_SECRET`.
 * Verification rejects expired/invalid tokens by throwing.
 */
export interface ITokenVerifier {
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
}

export const TOKEN_VERIFIER = Symbol("TOKEN_VERIFIER");
