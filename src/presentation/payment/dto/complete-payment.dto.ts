import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompletePaymentDto {
  @ApiProperty({
    description: 'Gateway transaction reference',
    example: 'TXN-9988776655',
  })
  @IsNotEmpty()
  @IsString()
  transactionRef: string;

  @ApiProperty({
    description: 'User ID who confirmed the payment',
    example: 'user-123',
  })
  @IsNotEmpty()
  @IsString()
  updatedBy: string;
}
