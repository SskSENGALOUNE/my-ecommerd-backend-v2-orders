import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderItemDto {
  @ApiProperty({ description: "Product ID", example: "prod-123" })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: "Product name (snapshot)",
    example: "Wireless Mouse",
  })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({ description: "Unit price (snapshot)", example: 29.99 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: "Quantity", example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: "Shipping address",
    example: "123 Main St, Vientiane, Laos",
  })
  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @ApiProperty({ type: [CreateOrderItemDto], description: "Order line items" })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
