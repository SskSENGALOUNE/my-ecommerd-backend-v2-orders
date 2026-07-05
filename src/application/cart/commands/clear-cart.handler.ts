import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { ClearCartCommand } from "./clear-cart.command";
import type { ICartRepository } from "../../../domain/cart/cart.repository";
import { CART_REPOSITORY } from "../../../domain/cart/cart.repository";
import { Cart } from "../../../domain/cart/cart.entity";
import { NotFoundDomainException } from "../../../domain/exceptions";

@CommandHandler(ClearCartCommand)
export class ClearCartHandler implements ICommandHandler<ClearCartCommand> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly repository: ICartRepository,
  ) {}

  async execute(command: ClearCartCommand): Promise<Cart> {
    const cart = await this.repository.findByCustomerId(command.customerId);

    if (!cart) {
      throw NotFoundDomainException.forResource("Cart", command.customerId);
    }

    cart.clear();

    return this.repository.save(cart);
  }
}
