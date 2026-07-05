import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePaymentChannelDto {
  @ApiPropertyOptional({ description: "Bank name", example: "BCEL" })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({
    description: "URL of the QR image customers scan to pay",
    example: "https://cdn.example.com/qr/bcel.png",
  })
  @IsOptional()
  @IsString()
  qrImageUrl?: string;

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

  @ApiPropertyOptional({
    description: "Whether the channel is shown to customers",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Display order (ascending)", example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
