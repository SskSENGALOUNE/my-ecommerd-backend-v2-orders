import { ApiProperty } from "@nestjs/swagger";
import { Order } from "../../../domain/order/order.entity";
import { OrderItem } from "../../../domain/order/order-item.entity";
import { OrderStatus } from "../../../domain/order/order-status.enum";

export class OrderItemResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string;

  @ApiProperty({ example: "prod-123" })
  productId: string;

  @ApiProperty({ example: "Wireless Mouse" })
  productName: string;

  @ApiProperty({ example: 29.99 })
  unitPrice: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 59.98 })
  subtotal: number;

  static fromDomain(item: OrderItem): OrderItemResponseDto {
    const dto = new OrderItemResponseDto();
    dto.id = item.id;
    dto.productId = item.productId;
    dto.productName = item.productName;
    dto.unitPrice = item.unitPrice;
    dto.quantity = item.quantity;
    dto.subtotal = item.subtotal;
    return dto;
  }
}

export class OrderResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string;

  @ApiProperty({ example: "ORD-20260625-ABCD1234" })
  orderNumber: string;

  @ApiProperty({ example: "cust-123" })
  customerId: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: 59.98 })
  totalAmount: number;

  @ApiProperty({ example: "123 Main St, Vientiane, Laos" })
  shippingAddress: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: "2026-06-25T10:30:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "user-123" })
  createdBy: string;

  @ApiProperty({ example: "2026-06-25T12:45:00.000Z" })
  updatedAt: Date;

  @ApiProperty({ example: "user-456" })
  updatedBy: string;

  static fromDomain(entity: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.customerId = entity.customerId;
    dto.status = entity.status;
    dto.totalAmount = entity.totalAmount;
    dto.shippingAddress = entity.shippingAddress;
    dto.items = entity.items.map(OrderItemResponseDto.fromDomain);
    dto.createdAt = entity.createdAt;
    dto.createdBy = entity.createdBy;
    dto.updatedAt = entity.updatedAt;
    dto.updatedBy = entity.updatedBy;
    return dto;
  }
}
