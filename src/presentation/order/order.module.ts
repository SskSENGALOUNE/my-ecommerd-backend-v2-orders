import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { OrderController } from "./order.controller";
import { ApplicationModule } from "../../application/application.module";
import { OrderInfrastructureModule } from "../../infrastructure/order/order-infrastructure.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
} from "../../application/order/commands";
import {
  GetOrderByIdHandler,
  GetAllOrdersHandler,
} from "../../application/order/queries";

const CommandHandlers = [
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
];

const QueryHandlers = [GetOrderByIdHandler, GetAllOrdersHandler];

@Module({
  imports: [CqrsModule, ApplicationModule, OrderInfrastructureModule],
  controllers: [OrderController],
  providers: [...CommandHandlers, ...QueryHandlers, JwtAuthGuard, RolesGuard],
})
export class OrderModule {}
