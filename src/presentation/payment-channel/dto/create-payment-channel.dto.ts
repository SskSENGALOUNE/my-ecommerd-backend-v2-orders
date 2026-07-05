import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePaymentChannelDto {
  @ApiProperty({ description: "Bank name", example: "BCEL" })
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @ApiProperty({
    description: "URL of the QR image customers scan to pay",
    example: "https://cdn.example.com/qr/bcel.png",
  })
  @IsNotEmpty()
  @IsString()
  qrImageUrl: string;

  @ApiPropertyOptional({
    description: "Account holder name",
    example: "MR SOMCHAI",
  })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({
    description: "Account number",
    example: "010-12-00-12345678",
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ description: "Display order (ascending)", example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
