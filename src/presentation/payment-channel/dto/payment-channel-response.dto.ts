import { ApiProperty } from "@nestjs/swagger";
import { PaymentChannel } from "../../../domain/payment-channel/payment-channel.entity";

export class PaymentChannelResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string;

  @ApiProperty({ example: "BCEL" })
  bankName: string;

  @ApiProperty({ example: "MR SOMCHAI", nullable: true })
  accountName: string | null;

  @ApiProperty({ example: "010-12-00-12345678", nullable: true })
  accountNumber: string | null;

  @ApiProperty({ example: "https://cdn.example.com/qr/bcel.png" })
  qrImageUrl: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  sortOrder: number;

  @ApiProperty({ example: "2026-07-05T10:30:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2026-07-05T12:45:00.000Z" })
  updatedAt: Date;

  static fromDomain(entity: PaymentChannel): PaymentChannelResponseDto {
    const dto = new PaymentChannelResponseDto();
    dto.id = entity.id;
    dto.bankName = entity.bankName;
    dto.accountName = entity.accountName;
    dto.accountNumber = entity.accountNumber;
    dto.qrImageUrl = entity.qrImageUrl;
    dto.isActive = entity.isActive;
    dto.sortOrder = entity.sortOrder;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
