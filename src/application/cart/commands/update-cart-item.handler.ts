import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { UpdateCartItemCommand } from "./update-cart-item.command";
import type { ICartRepository } from "../../../domain/cart/cart.repository";
import { CART_REPOSITORY } from "../../../domain/cart/cart.repository";
import { Cart } from "../../../domain/cart/cart.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";

@CommandHandler(UpdateCartItemCommand)
export class UpdateCartItemHandler implements ICommandHandler<UpdateCartItemCommand> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly repository: ICartRepository,
  ) {}

  async execute(command: UpdateCartItemCommand): Promise<Cart> {
    const cart = await this.repository.findByCustomerId(command.customerId);

    if (!cart) {
      throw NotFoundDomainException.forResource("Cart", command.customerId);
    }

    cart.updateItemQuantity(command.productId, command.quantity);

    return this.repository.save(cart);
  }
}
