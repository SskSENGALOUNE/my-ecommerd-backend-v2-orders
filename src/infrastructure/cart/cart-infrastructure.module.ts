import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CartRepositoryImpl } from '../prisma/repositories/cart.repository.impl';
import { CART_REPOSITORY } from '../../domain/cart/cart.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CART_REPOSITORY,
      useClass: CartRepositoryImpl,
    },
  ],
  exports: [CART_REPOSITORY],
})
export class CartInfrastructureModule {}
