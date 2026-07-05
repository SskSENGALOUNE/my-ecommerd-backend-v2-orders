import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";
import { CheckoutDto } from "./dto/checkout.dto";
import { OrderResponseDto } from "../order/dto/order-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CheckoutCommand } from "../../application/checkout/commands";
import { Order } from "../../domain/order/order.entity";

@ApiTags("checkout")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "checkout", version: "1" })
export class CheckoutController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Place an order from the authenticated customer's cart",
  })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiResponse({
    status: 404,
    description: "A product in the cart no longer exists.",
  })
  @ApiResponse({
    status: 422,
    description: "Cart empty, or a product is inactive / out of stock.",
  })
  async checkout(
    @CurrentUser("sub") customerId: string,
    @Body() dto: CheckoutDto,
  ): Promise<OrderResponseDto> {
    const order = await this.commandBus.execute<CheckoutCommand, Order>(
      new CheckoutCommand(customerId, dto.shippingAddress),
    );
    return OrderResponseDto.fromDomain(order);
  }
}
