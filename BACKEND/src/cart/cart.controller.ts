import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post()
    @ApiCreatedResponse({ description: 'Item added to cart' })
    addToCart(@Body() addToCartDto: AddToCartDto, @Req() req: any) {
        const userId = req.user.id;
        return this.cartService.addToCart(userId, addToCartDto);
    }

    @Get()
    @ApiOkResponse({ description: 'Get cart items' })
    getCart(@Req() req: any) {
        const userId = req.user.id;
        return this.cartService.getCart(userId);
    }

    @Get('total')
    @ApiOkResponse({ description: 'Get cart total and item count' })
    getCartTotal(@Req() req: any) {
        const userId = req.user.id;
        return this.cartService.getCartTotal(userId);
    }

    @Patch(':itemId')
    @ApiOkResponse({ description: 'Update cart item quantity' })
    updateCartItem(
        @Param('itemId') itemId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
        @Req() req: any
    ) {
        const userId = req.user.id;
        return this.cartService.updateCartItem(userId, itemId, updateCartItemDto);
    }

    @Delete(':itemId')
    @ApiOkResponse({ description: 'Remove item from cart' })
    removeFromCart(@Param('itemId') itemId: string, @Req() req: any) {
        const userId = req.user.id;
        return this.cartService.removeFromCart(userId, itemId);
    }

    @Delete()
    @ApiOkResponse({ description: 'Clear cart' })
    clearCart(@Req() req: any) {
        const userId = req.user.id;
        return this.cartService.clearCart(userId);
    }
}
