import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CartRepositoryImpl } from "../prisma/repositories/cart.repository.impl";
import { CART_REPOSITORY } from "../../domain/cart/cart.repository";
import { AuthInfrastructureModule } from "../auth/auth-infrastructure.module";

@Module({
  imports: [PrismaModule, AuthInfrastructureModule],
  providers: [
    {
      provide: CART_REPOSITORY,
      useClass: CartRepositoryImpl,
    },
  ],
  // Re-export so the cart presentation module gets TOKEN_VERIFIER through the
  // single infra import it already has (no new presentation→infra edge).
  exports: [CART_REPOSITORY, AuthInfrastructureModule],
})
export class CartInfrastructureModule {}
