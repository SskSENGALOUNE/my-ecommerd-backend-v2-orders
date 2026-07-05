import {
  Controller,
  Get,
  Post,
  Param,
  Body,
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
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { CompletePaymentDto } from "./dto/complete-payment.dto";
import { PaymentResponseDto } from "./dto/payment-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../../domain/auth/user-role.enum";
import {
  CreatePaymentCommand,
  CompletePaymentCommand,
  FailPaymentCommand,
} from "../../application/payment/commands";
import { GetPaymentByOrderQuery } from "../../application/payment/queries";

@ApiTags("payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: "orders/:orderId/payment", version: "1" })
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a payment for an order (amount = order total)",
  })
  @ApiParam({ name: "orderId", type: "string" })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: "Order not found." })
  @ApiResponse({ status: 409, description: "Payment already exists." })
  async create(
    @Param("orderId") orderId: string,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.commandBus.execute(
      new CreatePaymentCommand(orderId, dto.method),
    );
    return PaymentResponseDto.fromDomain(payment);
  }

  @Get()
  @ApiOperation({ summary: "Get the payment for an order" })
  @ApiParam({ name: "orderId", type: "string" })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: "Payment not found." })
  async findByOrder(
    @Param("orderId") orderId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.queryBus.execute(
      new GetPaymentByOrderQuery(orderId),
    );
    return PaymentResponseDto.fromDomain(payment);
  }

  @Post("complete")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Mark the payment completed (admin; moves order to PAID)",
  })
  @ApiParam({ name: "orderId", type: "string" })
  @ApiBody({ type: CompletePaymentDto })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({
    status: 422,
    description: "Invalid payment status transition.",
  })
  async complete(
    @Param("orderId") orderId: string,
    @Body() dto: CompletePaymentDto,
    @CurrentUser("sub") userId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.commandBus.execute(
      new CompletePaymentCommand(orderId, dto.transactionRef, userId),
    );
    return PaymentResponseDto.fromDomain(payment);
  }

  @Post("fail")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Mark the payment failed (admin)" })
  @ApiParam({ name: "orderId", type: "string" })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({
    status: 422,
    description: "Invalid payment status transition.",
  })
  async fail(@Param("orderId") orderId: string): Promise<PaymentResponseDto> {
    const payment = await this.commandBus.execute(
      new FailPaymentCommand(orderId),
    );
    return PaymentResponseDto.fromDomain(payment);
  }
}
