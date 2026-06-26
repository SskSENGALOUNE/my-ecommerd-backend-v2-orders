import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../../../domain/cart/cart.entity';
import { CartItem } from '../../../domain/cart/cart-item.entity';

export class CartItemResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'prod-123' })
  productId: string;

  @ApiProperty({ example: 29.99 })
  unitPrice: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 59.98 })
  subtotal: number;

  static fromDomain(item: CartItem): CartItemResponseDto {
    const dto = new CartItemResponseDto();
    dto.id = item.id;
    dto.productId = item.productId;
    dto.unitPrice = item.unitPrice;
    dto.quantity = item.quantity;
    dto.subtotal = item.subtotal;
    return dto;
  }
}

export class CartResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'cust-123' })
  customerId: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ example: 2, description: 'Total number of units in the cart' })
  totalItems: number;

  @ApiProperty({ example: 59.98 })
  totalAmount: number;

  static fromDomain(entity: Cart): CartResponseDto {
    const dto = new CartResponseDto();
    dto.id = entity.id;
    dto.customerId = entity.customerId;
    dto.items = entity.items.map(CartItemResponseDto.fromDomain);
    dto.totalItems = entity.totalItems;
    dto.totalAmount = entity.totalAmount;
    return dto;
  }
}
