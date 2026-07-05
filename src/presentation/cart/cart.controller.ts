import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { CartResponseDto } from "./dto/cart-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import {
  AddCartItemCommand,
  UpdateCartItemCommand,
  RemoveCartItemCommand,
  ClearCartCommand,
} from "../../application/cart/commands";
import { GetCartByCustomerQuery } from "../../application/cart/queries";

@ApiTags("carts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "carts", version: "1" })
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get the authenticated customer's cart" })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async getCart(
    @CurrentUser("sub") customerId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.queryBus.execute(
      new GetCartByCustomerQuery(customerId),
    );
    return CartResponseDto.fromDomain(cart);
  }

  @Post("items")
  @ApiOperation({
    summary: "Add an item to the cart (merges if it already exists)",
  })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, type: CartResponseDto })
  async addItem(
    @CurrentUser("sub") customerId: string,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.commandBus.execute(
      new AddCartItemCommand(
        customerId,
        dto.productId,
        dto.unitPrice,
        dto.quantity,
      ),
    );
    return CartResponseDto.fromDomain(cart);
  }

  @Patch("items/:productId")
  @ApiOperation({ summary: "Set the quantity of a cart item" })
  @ApiParam({ name: "productId", type: "string" })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, description: "Cart not found." })
  async updateItem(
    @CurrentUser("sub") customerId: string,
    @Param("productId") productId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.commandBus.execute(
      new UpdateCartItemCommand(customerId, productId, dto.quantity),
    );
    return CartResponseDto.fromDomain(cart);
  }

  @Delete("items/:productId")
  @ApiOperation({ summary: "Remove an item from the cart" })
  @ApiParam({ name: "productId", type: "string" })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, description: "Cart not found." })
  async removeItem(
    @CurrentUser("sub") customerId: string,
    @Param("productId") productId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.commandBus.execute(
      new RemoveCartItemCommand(customerId, productId),
    );
    return CartResponseDto.fromDomain(cart);
  }

  @Delete()
  @ApiOperation({ summary: "Clear all items from the cart" })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, description: "Cart not found." })
  async clear(
    @CurrentUser("sub") customerId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.commandBus.execute(
      new ClearCartCommand(customerId),
    );
    return CartResponseDto.fromDomain(cart);
  }
}
