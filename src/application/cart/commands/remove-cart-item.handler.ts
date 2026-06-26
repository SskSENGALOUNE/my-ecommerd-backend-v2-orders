import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RemoveCartItemCommand } from './remove-cart-item.command';
import type { ICartRepository } from '../../../domain/cart/cart.repository';
import { CART_REPOSITORY } from '../../../domain/cart/cart.repository';
import { Cart } from '../../../domain/cart/cart.entity';
import { NotFoundDomainException } from '../../../domain/exceptions';

@CommandHandler(RemoveCartItemCommand)
export class RemoveCartItemHandler
  implements ICommandHandler<RemoveCartItemCommand>
{
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly repository: ICartRepository,
  ) {}

  async execute(command: RemoveCartItemCommand): Promise<Cart> {
    const cart = await this.repository.findByCustomerId(command.customerId);

    if (!cart) {
      throw NotFoundDomainException.forResource('Cart', command.customerId);
    }

    cart.removeItem(command.productId);

    return this.repository.save(cart);
  }
}
