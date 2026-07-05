import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { OrderRepositoryImpl } from "../prisma/repositories/order.repository.impl";
import { ORDER_REPOSITORY } from "../../domain/order/order.repository";
import { AuthInfrastructureModule } from "../auth/auth-infrastructure.module";

@Module({
  imports: [PrismaModule, AuthInfrastructureModule],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepositoryImpl,
    },
  ],
  // Re-export so the order presentation module gets TOKEN_VERIFIER through the
  // single infra import it already has (no new presentation→infra edge).
  exports: [ORDER_REPOSITORY, AuthInfrastructureModule],
})
export class OrderInfrastructureModule {}
