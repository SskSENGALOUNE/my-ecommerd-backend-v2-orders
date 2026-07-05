import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CartController } from "./cart.controller";
import { ApplicationModule } from "../../application/application.module";
import { CartInfrastructureModule } from "../../infrastructure/cart/cart-infrastructure.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  AddCartItemHandler,
  UpdateCartItemHandler,
  RemoveCartItemHandler,
  ClearCartHandler,
} from "../../application/cart/commands";
import { GetCartByCustomerHandler } from "../../application/cart/queries";

const CommandHandlers = [
  AddCartItemHandler,
  UpdateCartItemHandler,
  RemoveCartItemHandler,
  ClearCartHandler,
];

const QueryHandlers = [GetCartByCustomerHandler];

@Module({
  imports: [CqrsModule, ApplicationModule, CartInfrastructureModule],
  controllers: [CartController],
  providers: [...CommandHandlers, ...QueryHandlers, JwtAuthGuard, RolesGuard],
})
export class CartModule {}
