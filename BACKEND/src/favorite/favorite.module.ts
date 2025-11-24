import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { UserFavoriteProduct } from './entities/user-favorite-product.entity';
import { Product } from '../product/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserFavoriteProduct, Product])],
    controllers: [FavoriteController],
    providers: [FavoriteService],
    exports: [FavoriteService],
})
export class FavoriteModule { }
