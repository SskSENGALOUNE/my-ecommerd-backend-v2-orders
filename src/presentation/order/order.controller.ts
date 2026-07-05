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
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderQueryDto } from "./dto/order-query.dto";
import { OrderResponseDto } from "./dto/order-response.dto";
import { PaginatedResponse } from "../common/dto/paginated-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../../domain/auth/user-role.enum";
import {
  CreateOrderCommand,
  UpdateOrderStatusCommand,
  CancelOrderCommand,
} from "../../application/order/commands";
import {
  GetOrderByIdQuery,
  GetAllOrdersQuery,
} from "../../application/order/queries";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: "orders", version: "1" })
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new order for the authenticated customer",
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiResponse({ status: 400, description: "Bad request." })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser("sub") userId: string,
  ): Promise<OrderResponseDto> {
    const command = new CreateOrderCommand(
      userId,
      dto.shippingAddress,
      dto.items,
      userId,
    );
    const created = await this.commandBus.execute(command);
    return OrderResponseDto.fromDomain(created);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "List orders (admin; paginated, optional customer filter)",
  })
  @ApiResponse({ status: 200, description: "Paginated list of orders." })
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

  @Get(":id")
  @ApiOperation({ summary: "Get an order by ID" })
  @ApiParam({ name: "id", description: "Order UUID", type: "string" })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: "Order not found." })
  async findOne(@Param("id") id: string): Promise<OrderResponseDto> {
    const result = await this.queryBus.execute(new GetOrderByIdQuery(id));
    return OrderResponseDto.fromDomain(result);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Update an order status (admin; enforces valid transitions)",
  })
  @ApiParam({ name: "id", description: "Order UUID", type: "string" })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: "Order not found." })
  @ApiResponse({ status: 422, description: "Invalid status transition." })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser("sub") userId: string,
  ): Promise<OrderResponseDto> {
    const updated = await this.commandBus.execute(
      new UpdateOrderStatusCommand(id, dto.status, userId),
    );
    return OrderResponseDto.fromDomain(updated);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel an order (only before it ships)" })
  @ApiParam({ name: "id", description: "Order UUID", type: "string" })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: "Order not found." })
  @ApiResponse({
    status: 422,
    description: "Order can no longer be cancelled.",
  })
  async cancel(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ): Promise<OrderResponseDto> {
    const cancelled = await this.commandBus.execute(
      new CancelOrderCommand(id, userId),
    );
    return OrderResponseDto.fromDomain(cancelled);
  }
}
