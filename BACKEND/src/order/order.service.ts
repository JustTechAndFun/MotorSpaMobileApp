import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        private readonly cartService: CartService,
    ) { }

    async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
        // Fetch products
        const productIds = dto.items.map(item => item.productId);
        const products = await this.productRepo.findByIds(productIds);

        if (products.length !== productIds.length) {
            throw new BadRequestException('Some products not found');
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems: Partial<OrderItem>[] = [];

        for (const itemDto of dto.items) {
            const product = products.find(p => p.id === itemDto.productId);
            if (!product) continue;

            const itemSubtotal = Number(product.price) * itemDto.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                price: Number(product.price),
                quantity: itemDto.quantity,
                subtotal: itemSubtotal,
            });
        }

        const shippingFee = 0; // Can be calculated based on location
        const discount = 0; // Can be calculated based on promos
        const total = subtotal + shippingFee - discount;

        // Generate order number
        const orderNumber = await this.generateOrderNumber();

        // Create order
        const order = this.orderRepo.create({
            orderNumber,
            userId,
            deliveryAddressId: dto.deliveryAddressId,
            subtotal,
            shippingFee,
            discount,
            total,
            paymentMethod: dto.paymentMethod || 'COD',
            notes: dto.notes,
            items: orderItems as OrderItem[],
        });

        return await this.orderRepo.save(order);
    }

    async createOrderFromCart(userId: string, dto: CreateOrderFromCartDto): Promise<Order> {
        // Get cart items
        const cartItems = await this.cartService.getCart(userId);

        if (!cartItems.length) {
            throw new BadRequestException('Cart is empty');
        }

        // Convert cart items to order items
        const orderDto: CreateOrderDto = {
            deliveryAddressId: dto.deliveryAddressId,
            paymentMethod: dto.paymentMethod,
            notes: dto.notes,
            items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
        };

        const order = await this.createOrder(userId, orderDto);

        // Clear cart after successful order
        await this.cartService.clearCart(userId);

        return order;
    }

    async getUserOrders(userId: string): Promise<Order[]> {
        return await this.orderRepo.find({
            where: { userId },
            relations: ['items', 'items.product', 'deliveryAddress'],
            order: { createdAt: 'DESC' },
        });
    }

    async getOrderById(userId: string, orderId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId, userId },
            relations: ['items', 'items.product', 'deliveryAddress', 'user'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async getAllOrders(): Promise<Order[]> {
        return await this.orderRepo.find({
            relations: ['items', 'items.product', 'deliveryAddress', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<Order> {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        order.status = dto.status;
        if (dto.notes) {
            order.notes = dto.notes;
        }

        return await this.orderRepo.save(order);
    }

    async cancelOrder(userId: string, orderId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId, userId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== 'PENDING') {
            throw new BadRequestException('Only pending orders can be cancelled');
        }

        order.status = 'CANCELLED' as any;
        return await this.orderRepo.save(order);
    }

    private async generateOrderNumber(): Promise<string> {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Find last order of the day
        const lastOrder = await this.orderRepo
            .createQueryBuilder('order')
            .where('order.orderNumber LIKE :pattern', { pattern: `ORD-${dateStr}%` })
            .orderBy('order.orderNumber', 'DESC')
            .getOne();

        let sequence = 1;
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
            sequence = lastSequence + 1;
        }

        return `ORD-${dateStr}-${sequence.toString().padStart(3, '0')}`;
    }
}
