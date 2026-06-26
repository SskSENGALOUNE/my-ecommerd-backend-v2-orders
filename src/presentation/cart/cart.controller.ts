import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import {
  AddCartItemCommand,
  UpdateCartItemCommand,
  RemoveCartItemCommand,
  ClearCartCommand,
} from '../../application/cart/commands';
import { GetCartByCustomerQuery } from '../../application/cart/queries';

@ApiTags('carts')
@Controller({ path: 'carts', version: '1' })
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':customerId')
  @ApiOperation({ summary: "Get a customer's cart" })
  @ApiParam({ name: 'customerId', type: 'string' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async getCart(
    @Param('customerId') customerId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.queryBus.execute(
      new GetCartByCustomerQuery(customerId),
    );
    return CartResponseDto.fromDomain(cart);
  }

  @Post(':customerId/items')
  @ApiOperation({ summary: 'Add an item to the cart (merges if it already exists)' })
  @ApiParam({ name: 'customerId', type: 'string' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, type: CartResponseDto })
  async addItem(
    @Param('customerId') customerId: string,
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

  @Patch(':customerId/items/:productId')
  @ApiOperation({ summary: 'Set the quantity of a cart item' })
  @ApiParam({ name: 'customerId', type: 'string' })
  @ApiParam({ name: 'productId', type: 'string' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Cart not found.' })
  async updateItem(
    @Param('customerId') customerId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.commandBus.execute(
      new UpdateCartItemCommand(customerId, productId, dto.quantity),
    );
    return CartResponseDto.fromDomain(cart);
  }

  @Delete(':customerId/items/:productId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'customerId', type: 'string' })
  @ApiParam({ name: 'productId', type: 'string' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Cart not found.' })
  async removeItem(
    @Param('customerId') customerId: string,
    @Param('productId') productId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.commandBus.execute(
      new RemoveCartItemCommand(customerId, productId),
    );
    return CartResponseDto.fromDomain(cart);
  }

  @Delete(':customerId')
  @ApiOperation({ summary: 'Clear all items from the cart' })
  @ApiParam({ name: 'customerId', type: 'string' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Cart not found.' })
  async clear(
    @Param('customerId') customerId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.commandBus.execute(new ClearCartCommand(customerId));
    return CartResponseDto.fromDomain(cart);
  }
}
