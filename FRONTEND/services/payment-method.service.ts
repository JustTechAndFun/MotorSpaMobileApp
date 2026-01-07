import { apiClient } from '@/config/api.client';
import type { CreatePaymentMethodRequest, PaymentMethod, UpdatePaymentMethodRequest } from '@/types/api.types';

/**
 * Get all payment methods for the current user
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get('/payment-methods');
  return (response.data as any).data || response.data;
};

/**
 * Get a single payment method by ID
 */
export const getPaymentMethodById = async (id: string | number): Promise<PaymentMethod> => {
  const response = await apiClient.get(`/payment-methods/${id}`);
  return (response.data as any).data || response.data;
};

/**
 * Create a new payment method
 */
export const createPaymentMethod = async (data: CreatePaymentMethodRequest): Promise<PaymentMethod> => {
  const response = await apiClient.post('/payment-methods', data);
  return (response.data as any).data || response.data;
};

/**
 * Update an existing payment method
 */
export const updatePaymentMethod = async (
  id: string | number,
  data: UpdatePaymentMethodRequest
): Promise<PaymentMethod> => {
  const response = await apiClient.patch(`/payment-methods/${id}`, data);
  return (response.data as any).data || response.data;
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/payment-methods/${id}`);
};

export const paymentMethodService = {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
