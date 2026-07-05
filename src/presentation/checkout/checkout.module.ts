import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CheckoutController } from "./checkout.controller";
import { ApplicationModule } from "../../application/application.module";
import { CheckoutInfrastructureModule } from "../../infrastructure/checkout/checkout-infrastructure.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CheckoutCommandHandlers } from "../../application/checkout/commands";

@Module({
  imports: [CqrsModule, ApplicationModule, CheckoutInfrastructureModule],
  controllers: [CheckoutController],
  providers: [...CheckoutCommandHandlers, JwtAuthGuard],
})
export class CheckoutModule {}
