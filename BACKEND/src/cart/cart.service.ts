import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartItem)
        private readonly cartRepo: Repository<CartItem>,
    ) { }

    async addToCart(userId: string, dto: AddToCartDto): Promise<CartItem> {
        // Check if item already exists in cart
        const existing = await this.cartRepo.findOne({
            where: { userId, productId: dto.productId },
        });

        if (existing) {
            // Update quantity if item exists
            existing.quantity += dto.quantity;
            return await this.cartRepo.save(existing);
        }

        // Create new cart item
        const cartItem = this.cartRepo.create({
            userId,
            productId: dto.productId,
            quantity: dto.quantity,
        });
        return await this.cartRepo.save(cartItem);
    }

    async getCart(userId: string): Promise<CartItem[]> {
        return await this.cartRepo.find({
            where: { userId },
            relations: ['product'],
            order: { createdAt: 'DESC' },
        });
    }

    async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartItem> {
        const item = await this.cartRepo.findOne({
            where: { id: itemId, userId },
        });

        if (!item) {
            throw new NotFoundException('Cart item not found');
        }

        item.quantity = dto.quantity;
        return await this.cartRepo.save(item);
    }

    async removeFromCart(userId: string, itemId: string): Promise<{ message: string }> {
        const item = await this.cartRepo.findOne({
            where: { id: itemId, userId },
        });

        if (!item) {
            throw new NotFoundException('Cart item not found');
        }

        await this.cartRepo.remove(item);
        return { message: 'Item removed from cart' };
    }

    async clearCart(userId: string): Promise<{ message: string }> {
        await this.cartRepo.delete({ userId });
        return { message: 'Cart cleared' };
    }

    async getCartTotal(userId: string): Promise<{ total: number; itemCount: number }> {
        const items = await this.cartRepo.find({
            where: { userId },
            relations: ['product'],
        });

        const total = items.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity);
        }, 0);

        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return { total, itemCount };
    }
}
