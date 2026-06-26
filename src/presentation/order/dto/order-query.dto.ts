import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class OrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by customer ID', example: 'cust-123' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
