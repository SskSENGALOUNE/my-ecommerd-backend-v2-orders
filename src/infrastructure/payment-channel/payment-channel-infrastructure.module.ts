import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PaymentChannelRepositoryImpl } from "../prisma/repositories/payment-channel.repository.impl";
import { PAYMENT_CHANNEL_REPOSITORY } from "../../domain/payment-channel/payment-channel.repository";
import { AuthInfrastructureModule } from "../auth/auth-infrastructure.module";

@Module({
  imports: [PrismaModule, AuthInfrastructureModule],
  providers: [
    {
      provide: PAYMENT_CHANNEL_REPOSITORY,
      useClass: PaymentChannelRepositoryImpl,
    },
  ],
  // Re-export so the presentation module gets TOKEN_VERIFIER through the single
  // infra import it already has (no new presentation→infra edge).
  exports: [PAYMENT_CHANNEL_REPOSITORY, AuthInfrastructureModule],
})
export class PaymentChannelInfrastructureModule {}
