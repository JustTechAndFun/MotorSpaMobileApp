import { apiClient } from '../config/api.client';
import type { Product } from '../types/api.types';

/**
 * Favorite Service
 * Handles all favorite-related API calls
 */

class FavoriteService {
  /**
   * Get user's favorite products
   */
  async getFavorites(): Promise<Product[]> {
    const response = await apiClient.get('/favorites');
    return response.data.data || response.data;
  }

  /**
   * Add product to favorites
   */
  async addToFavorites(productId: string | number): Promise<void> {
    await apiClient.post(`/favorites/${productId}`);
  }

  /**
   * Remove product from favorites
   */
  async removeFromFavorites(productId: string | number): Promise<void> {
    await apiClient.delete(`/favorites/${productId}`);
  }

  /**
   * Check if product is in favorites
   */
  async checkFavorite(productId: string | number): Promise<boolean> {
    const response = await apiClient.get(`/favorites/check/${productId}`);
    const data = response.data.data || response.data;
    return data.isFavorite;
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(productId: string | number, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.removeFromFavorites(productId);
    } else {
      await this.addToFavorites(productId);
    }
  }
}

export const favoriteService = new FavoriteService();
export default favoriteService;
