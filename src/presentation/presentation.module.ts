import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ApplicationModule } from "../application/application.module";
import { OrderModule } from "./order/order.module";
import { CartModule } from "./cart/cart.module";
import { PaymentModule } from "./payment/payment.module";
import { PaymentChannelModule } from "./payment-channel/payment-channel.module";
import { CheckoutModule } from "./checkout/checkout.module";

@Module({
  imports: [
    CqrsModule,
    ApplicationModule,
    OrderModule,
    CartModule,
    PaymentModule,
    PaymentChannelModule,
    CheckoutModule,
  ],
  exports: [
    OrderModule,
    CartModule,
    PaymentModule,
    PaymentChannelModule,
    CheckoutModule,
  ],
})
export class PresentationModule {}
