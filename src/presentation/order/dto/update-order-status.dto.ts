import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "../../../domain/order/order-status.enum";

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: "New order status",
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
