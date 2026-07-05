import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CheckoutDto {
  @ApiProperty({
    description: "Shipping address for the order",
    example: "123 Main St, Vientiane, Laos",
  })
  @IsNotEmpty()
  @IsString()
  shippingAddress: string;
}
