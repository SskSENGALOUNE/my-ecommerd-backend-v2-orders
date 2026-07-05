import { IsNotEmpty, IsString, IsNumber, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddCartItemDto {
  @ApiProperty({ description: "Product ID", example: "prod-123" })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: "Unit price", example: 29.99 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: "Quantity to add", example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
