import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CreatePaymentChannelDto } from "./dto/create-payment-channel.dto";
import { UpdatePaymentChannelDto } from "./dto/update-payment-channel.dto";
import { PaymentChannelResponseDto } from "./dto/payment-channel-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../../domain/auth/user-role.enum";
import {
  CreatePaymentChannelCommand,
  UpdatePaymentChannelCommand,
  DeletePaymentChannelCommand,
} from "../../application/payment-channel/commands";
import {
  GetPaymentChannelsQuery,
  GetPaymentChannelByIdQuery,
} from "../../application/payment-channel/queries";
import { PaymentChannel } from "../../domain/payment-channel/payment-channel.entity";

@ApiTags("payment-channels")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: "payment-channels", version: "1" })
export class PaymentChannelController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get("active")
  @ApiOperation({
    summary: "List active payment channels (bank + QR) for customers to pay",
  })
  @ApiResponse({ status: 200, type: [PaymentChannelResponseDto] })
  async findActive(): Promise<PaymentChannelResponseDto[]> {
    const channels = await this.queryBus.execute<
      GetPaymentChannelsQuery,
      PaymentChannel[]
    >(new GetPaymentChannelsQuery(true));
    return channels.map((c) => PaymentChannelResponseDto.fromDomain(c));
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "List all payment channels (admin, incl. inactive)",
  })
  @ApiResponse({ status: 200, type: [PaymentChannelResponseDto] })
  async findAll(): Promise<PaymentChannelResponseDto[]> {
    const channels = await this.queryBus.execute<
      GetPaymentChannelsQuery,
      PaymentChannel[]
    >(new GetPaymentChannelsQuery(false));
    return channels.map((c) => PaymentChannelResponseDto.fromDomain(c));
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get a payment channel by ID (admin)" })
  @ApiParam({ name: "id", description: "Payment channel UUID", type: "string" })
  @ApiResponse({ status: 200, type: PaymentChannelResponseDto })
  @ApiResponse({ status: 404, description: "Payment channel not found." })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PaymentChannelResponseDto> {
    const channel = await this.queryBus.execute<
      GetPaymentChannelByIdQuery,
      PaymentChannel
    >(new GetPaymentChannelByIdQuery(id));
    return PaymentChannelResponseDto.fromDomain(channel);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a payment channel (admin)" })
  @ApiBody({ type: CreatePaymentChannelDto })
  @ApiResponse({ status: 201, type: PaymentChannelResponseDto })
  async create(
    @Body() dto: CreatePaymentChannelDto,
  ): Promise<PaymentChannelResponseDto> {
    const channel = await this.commandBus.execute<
      CreatePaymentChannelCommand,
      PaymentChannel
    >(
      new CreatePaymentChannelCommand(
        dto.bankName,
        dto.qrImageUrl,
        dto.accountName,
        dto.accountNumber,
        dto.sortOrder,
      ),
    );
    return PaymentChannelResponseDto.fromDomain(channel);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Update a payment channel (admin)" })
  @ApiParam({ name: "id", description: "Payment channel UUID", type: "string" })
  @ApiBody({ type: UpdatePaymentChannelDto })
  @ApiResponse({ status: 200, type: PaymentChannelResponseDto })
  @ApiResponse({ status: 404, description: "Payment channel not found." })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentChannelDto,
  ): Promise<PaymentChannelResponseDto> {
    const channel = await this.commandBus.execute<
      UpdatePaymentChannelCommand,
      PaymentChannel
    >(
      new UpdatePaymentChannelCommand(
        id,
        dto.bankName,
        dto.qrImageUrl,
        dto.accountName,
        dto.accountNumber,
        dto.isActive,
        dto.sortOrder,
      ),
    );
    return PaymentChannelResponseDto.fromDomain(channel);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a payment channel (admin)" })
  @ApiParam({ name: "id", description: "Payment channel UUID", type: "string" })
  @ApiResponse({ status: 204, description: "Payment channel deleted." })
  @ApiResponse({ status: 404, description: "Payment channel not found." })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeletePaymentChannelCommand, void>(
      new DeletePaymentChannelCommand(id),
    );
  }
}
