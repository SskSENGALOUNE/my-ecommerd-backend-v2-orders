import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PaymentController } from "./payment.controller";
import { ApplicationModule } from "../../application/application.module";
import { PaymentInfrastructureModule } from "../../infrastructure/payment/payment-infrastructure.module";
import { OrderInfrastructureModule } from "../../infrastructure/order/order-infrastructure.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  CreatePaymentHandler,
  CompletePaymentHandler,
  FailPaymentHandler,
} from "../../application/payment/commands";
import { GetPaymentByOrderHandler } from "../../application/payment/queries";

const CommandHandlers = [
  CreatePaymentHandler,
  CompletePaymentHandler,
  FailPaymentHandler,
];

const QueryHandlers = [GetPaymentByOrderHandler];

@Module({
  imports: [
    CqrsModule,
    ApplicationModule,
    PaymentInfrastructureModule,
    OrderInfrastructureModule,
  ],
  controllers: [PaymentController],
  providers: [...CommandHandlers, ...QueryHandlers, JwtAuthGuard, RolesGuard],
})
export class PaymentModule {}
