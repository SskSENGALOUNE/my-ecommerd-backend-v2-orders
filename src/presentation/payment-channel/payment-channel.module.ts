import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PaymentChannelController } from "./payment-channel.controller";
import { ApplicationModule } from "../../application/application.module";
import { PaymentChannelInfrastructureModule } from "../../infrastructure/payment-channel/payment-channel-infrastructure.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PaymentChannelCommandHandlers } from "../../application/payment-channel/commands";
import { PaymentChannelQueryHandlers } from "../../application/payment-channel/queries";

@Module({
  imports: [CqrsModule, ApplicationModule, PaymentChannelInfrastructureModule],
  controllers: [PaymentChannelController],
  providers: [
    ...PaymentChannelCommandHandlers,
    ...PaymentChannelQueryHandlers,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class PaymentChannelModule {}
