import apiClient from '../config/api.client';
import {
  AddToCartRequest,
  ApiResponse,
  CartItem
} from '../types/api.types';

/**
 * Cart Service
 * Các API liên quan đến giỏ hàng
 */
class CartService {
  /**
   * Lấy giỏ hàng
   */
  async getCart(): Promise<CartItem[]> {
    const response = await apiClient.get<ApiResponse<CartItem[]>>('/cart');
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy tổng giỏ hàng và số lượng items
   */
  async getCartTotal(): Promise<{ total: number; itemCount: number }> {
    const response = await apiClient.get<ApiResponse<{ total: number; itemCount: number }>>('/cart/total');
    return (response.data as any).data || response.data;
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    const response = await apiClient.post<ApiResponse<CartItem>>('/cart', data);
    return (response.data as any).data || response.data;
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  async updateCartItem(itemId: string | number, quantity: number): Promise<CartItem> {
    const response = await apiClient.patch<ApiResponse<CartItem>>(
      `/cart/${itemId}`,
      { quantity }
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  async removeFromCart(itemId: string | number): Promise<void> {
    await apiClient.delete(`/cart/${itemId}`);
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  }
  }


export const cartService = new CartService();
export default cartService;
