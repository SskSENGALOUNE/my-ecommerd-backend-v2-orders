import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TOKEN_VERIFIER } from "../../domain/auth/token-verifier";
import { JwtTokenVerifier } from "./jwt-token-verifier";

/**
 * Wires the token-verification port to its `@nestjs/jwt` adapter. Feature
 * modules import this to secure their routes with `JwtAuthGuard`.
 */
@Module({
  imports: [JwtModule.register({})],
  providers: [{ provide: TOKEN_VERIFIER, useClass: JwtTokenVerifier }],
  exports: [TOKEN_VERIFIER],
})
export class AuthInfrastructureModule {}
