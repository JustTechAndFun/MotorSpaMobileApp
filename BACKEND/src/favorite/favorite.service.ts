import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavoriteProduct } from './entities/user-favorite-product.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectRepository(UserFavoriteProduct)
        private readonly favoriteRepo: Repository<UserFavoriteProduct>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) { }

    async addFavorite(userId: string, productId: string): Promise<{ success: boolean; message: string }> {
        const product = await this.productRepo.findOne({ where: { id: productId } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const existing = await this.favoriteRepo.findOne({
            where: { userId, productId },
        });

        if (existing) {
            throw new ConflictException('Product already in favorites');
        }

        const favorite = this.favoriteRepo.create({ userId, productId });
        await this.favoriteRepo.save(favorite);

        return { success: true, message: 'Product added to favorites' };
    }

    async removeFavorite(userId: string, productId: string): Promise<{ success: boolean; message: string }> {
        const favorite = await this.favoriteRepo.findOne({
            where: { userId, productId },
        });

        if (!favorite) {
            throw new NotFoundException('Favorite not found');
        }

        await this.favoriteRepo.remove(favorite);
        return { success: true, message: 'Product removed from favorites' };
    }

    async getUserFavorites(userId: string): Promise<Product[]> {
        const favorites = await this.favoriteRepo.find({
            where: { userId },
            relations: ['product', 'product.category', 'product.subCategory'],
            order: { createdAt: 'DESC' },
        });

        return favorites.map((fav) => fav.product);
    }

    async isFavorite(userId: string, productId: string): Promise<boolean> {
        const favorite = await this.favoriteRepo.findOne({
            where: { userId, productId },
        });
        return !!favorite;
    }
}
