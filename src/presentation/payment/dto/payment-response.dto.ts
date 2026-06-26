import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../../../domain/payment/payment.entity';
import { PaymentStatus } from '../../../domain/payment/payment-status.enum';
import { PaymentMethod } from '../../../domain/payment/payment-method.enum';

export class PaymentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174000' })
  orderId: string;

  @ApiProperty({ example: 59.98 })
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER })
  method: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ example: 'TXN-9988776655', nullable: true })
  transactionRef: string | null;

  @ApiProperty({ example: '2026-06-25T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-25T12:45:00.000Z' })
  updatedAt: Date;

  static fromDomain(entity: Payment): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = entity.id;
    dto.orderId = entity.orderId;
    dto.amount = entity.amount;
    dto.method = entity.method;
    dto.status = entity.status;
    dto.transactionRef = entity.transactionRef;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
