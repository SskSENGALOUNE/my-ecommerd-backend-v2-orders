import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { OrderInfrastructureModule } from './order/order-infrastructure.module';
import { CartInfrastructureModule } from './cart/cart-infrastructure.module';
import { PaymentInfrastructureModule } from './payment/payment-infrastructure.module';

@Module({
  imports: [
    PrismaModule,
    OrderInfrastructureModule,
    CartInfrastructureModule,
    PaymentInfrastructureModule,
  ],
  exports: [
    PrismaModule,
    OrderInfrastructureModule,
    CartInfrastructureModule,
    PaymentInfrastructureModule,
  ],
})
export class InfrastructureModule {}
