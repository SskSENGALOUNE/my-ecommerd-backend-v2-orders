import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import {
  CreateOrderCommand,
  UpdateOrderStatusCommand,
  CancelOrderCommand,
} from '../../application/order/commands';
import {
  GetOrderByIdQuery,
  GetAllOrdersQuery,
} from '../../application/order/queries';

@ApiTags('orders')
@Controller({ path: 'orders', version: '1' })
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    const command = new CreateOrderCommand(
      dto.customerId,
      dto.shippingAddress,
      dto.items,
      dto.createdBy,
    );
    const created = await this.commandBus.execute(command);
    return OrderResponseDto.fromDomain(created);
  }

  @Get()
  @ApiOperation({ summary: 'List orders (paginated, optional customer filter)' })
  @ApiResponse({ status: 200, description: 'Paginated list of orders.' })
  async findAll(
    @Query() query: OrderQueryDto,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    const result = await this.queryBus.execute(
      new GetAllOrdersQuery(
        query.page,
        query.limit,
        query.sortBy,
        query.sortOrder,
        query.customerId,
      ),
    );
    return PaginatedResponse.build(
      result.items.map(OrderResponseDto.fromDomain),
      result.total,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID', type: 'string' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const result = await this.queryBus.execute(new GetOrderByIdQuery(id));
    return OrderResponseDto.fromDomain(result);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update an order status (enforces valid transitions)' })
  @ApiParam({ name: 'id', description: 'Order UUID', type: 'string' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiResponse({ status: 422, description: 'Invalid status transition.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const updated = await this.commandBus.execute(
      new UpdateOrderStatusCommand(id, dto.status, dto.updatedBy),
    );
    return OrderResponseDto.fromDomain(updated);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (only before it ships)' })
  @ApiParam({ name: 'id', description: 'Order UUID', type: 'string' })
  @ApiBody({ type: CancelOrderDto })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiResponse({ status: 422, description: 'Order can no longer be cancelled.' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const cancelled = await this.commandBus.execute(
      new CancelOrderCommand(id, dto.updatedBy),
    );
    return OrderResponseDto.fromDomain(cancelled);
  }
}
