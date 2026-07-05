import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentMethod } from "../../../domain/payment/payment-method.enum";

export class CreatePaymentDto {
  @ApiProperty({
    description: "Payment method",
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
