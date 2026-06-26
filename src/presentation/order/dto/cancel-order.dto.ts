import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiProperty({
    description: 'User ID who cancelled this order',
    example: 'user-123',
  })
  @IsNotEmpty()
  @IsString()
  updatedBy: string;
}
