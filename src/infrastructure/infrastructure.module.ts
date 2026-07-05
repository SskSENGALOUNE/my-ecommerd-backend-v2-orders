import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { OrderInfrastructureModule } from "./order/order-infrastructure.module";
import { CartInfrastructureModule } from "./cart/cart-infrastructure.module";
import { PaymentInfrastructureModule } from "./payment/payment-infrastructure.module";
import { PaymentChannelInfrastructureModule } from "./payment-channel/payment-channel-infrastructure.module";
import { CheckoutInfrastructureModule } from "./checkout/checkout-infrastructure.module";

@Module({
  imports: [
    PrismaModule,
    OrderInfrastructureModule,
    CartInfrastructureModule,
    PaymentInfrastructureModule,
    PaymentChannelInfrastructureModule,
    CheckoutInfrastructureModule,
  ],
  exports: [
    PrismaModule,
    OrderInfrastructureModule,
    CartInfrastructureModule,
    PaymentInfrastructureModule,
    PaymentChannelInfrastructureModule,
    CheckoutInfrastructureModule,
  ],
})
export class InfrastructureModule {}
