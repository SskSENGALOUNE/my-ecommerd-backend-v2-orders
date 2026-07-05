import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PaymentRepositoryImpl } from "../prisma/repositories/payment.repository.impl";
import { PAYMENT_REPOSITORY } from "../../domain/payment/payment.repository";
import { AuthInfrastructureModule } from "../auth/auth-infrastructure.module";

@Module({
  imports: [PrismaModule, AuthInfrastructureModule],
  providers: [
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepositoryImpl,
    },
  ],
  // Re-export so the payment presentation module gets TOKEN_VERIFIER through the
  // single infra import it already has (no new presentation→infra edge).
  exports: [PAYMENT_REPOSITORY, AuthInfrastructureModule],
})
export class PaymentInfrastructureModule {}
