import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderRepositoryImpl } from '../prisma/repositories/order.repository.impl';
import { ORDER_REPOSITORY } from '../../domain/order/order.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepositoryImpl,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrderInfrastructureModule {}
