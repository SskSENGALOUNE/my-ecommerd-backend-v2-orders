import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentRepositoryImpl } from '../prisma/repositories/payment.repository.impl';
import { PAYMENT_REPOSITORY } from '../../domain/payment/payment.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepositoryImpl,
    },
  ],
  exports: [PAYMENT_REPOSITORY],
})
export class PaymentInfrastructureModule {}
