import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddCartItemCommand } from './add-cart-item.command';
import type { ICartRepository } from '../../../domain/cart/cart.repository';
import { CART_REPOSITORY } from '../../../domain/cart/cart.repository';
import { Cart } from '../../../domain/cart/cart.entity';

@CommandHandler(AddCartItemCommand)
export class AddCartItemHandler implements ICommandHandler<AddCartItemCommand> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly repository: ICartRepository,
  ) {}

  async execute(command: AddCartItemCommand): Promise<Cart> {
    const cart =
      (await this.repository.findByCustomerId(command.customerId)) ??
      Cart.create({ customerId: command.customerId });

    cart.addItem({
      productId: command.productId,
      unitPrice: command.unitPrice,
      quantity: command.quantity,
    });

    return this.repository.save(cart);
  }
}
