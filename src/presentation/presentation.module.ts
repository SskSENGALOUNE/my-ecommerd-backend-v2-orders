import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ApplicationModule } from '../application/application.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [CqrsModule, ApplicationModule, OrderModule, CartModule, PaymentModule],
  exports: [OrderModule, CartModule, PaymentModule],
})
export class PresentationModule {}
