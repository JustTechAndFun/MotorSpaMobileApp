import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) { }

    @Post(':productId')
    @ApiCreatedResponse({ description: 'Product added to favorites' })
    addFavorite(
        @Param('productId') productId: string,
        @Req() req: Request & { user?: { id: string } },
    ) {
        const userId = req.user?.id || '';
        return this.favoriteService.addFavorite(userId, productId);
    }

    @Delete(':productId')
    @ApiOkResponse({ description: 'Product removed from favorites' })
    removeFavorite(
        @Param('productId') productId: string,
        @Req() req: Request & { user?: { id: string } },
    ) {
        const userId = req.user?.id || '';
        return this.favoriteService.removeFavorite(userId, productId);
    }

    @Get()
    @ApiOkResponse({ description: 'Returns user favorite products' })
    getUserFavorites(@Req() req: Request & { user?: { id: string } }) {
        const userId = req.user?.id || '';
        return this.favoriteService.getUserFavorites(userId);
    }

    @Get('check/:productId')
    @ApiOkResponse({ description: 'Check if product is in user favorites' })
    async isFavorite(
        @Param('productId') productId: string,
        @Req() req: Request & { user?: { id: string } },
    ) {
        const userId = req.user?.id || '';
        const isFavorite = await this.favoriteService.isFavorite(userId, productId);
        return { isFavorite };
    }
}
