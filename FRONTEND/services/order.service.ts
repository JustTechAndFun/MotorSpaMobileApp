import { apiClient } from '@/config/api.client';
import type { CreateOrderRequest, Order, UpdateOrderStatusRequest } from '@/types/api.types';

export const orderService = {
  /**
   * Create new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post('/orders', data);
    return (response.data as any).data || response.data;
  },

  /**
   * Get user's orders
   */
  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get('/orders');
    return (response.data as any).data || response.data;
  },

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}`);
    return (response.data as any).data || response.data;
  },

  /**
   * Cancel order (user)
   */
  async cancelOrder(id: string): Promise<Order> {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return (response.data as any).data || response.data;
  },

  // Admin methods
  /**
   * Get all orders (admin only)
   */
  async getAllOrders(): Promise<Order[]> {
    const response = await apiClient.get('/orders/all');
    return (response.data as any).data || response.data;
  },

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await apiClient.patch(`/orders/${id}/status`, data);
    return (response.data as any).data || response.data;
  },
};
