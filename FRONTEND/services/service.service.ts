import { apiClient } from '../config/api.client';
import type { Service } from '../types/api.types';

/**
 * Service Management
 * Handles all service-related API calls (not products)
 */
class ServiceService {
  /**
   * Get all services
   */
  async getServices(): Promise<Service[]> {
    // Backend stores services in /products with stock = 0
    const response = await apiClient.get('/products');
    const data = (response.data.data || response.data) as Service[];
    // Filter services: stock = 0
    return data.filter(item => 
      item.stock === 0 || 
      item.type === 'service'
    );
  }

  /**
   * Get active services only
   */
  async getActiveServices(): Promise<Service[]> {
    // Backend stores services in /products/available with stock = 0
    const response = await apiClient.get('/products/available');
    const data = (response.data.data || response.data) as Service[];
    // Filter services: stock = 0 and isAvailable = true
    return data.filter(item => 
      (item.isAvailable ?? true) && 
      (item.stock === 0 || item.type === 'service')
    );
  }

  /**
   * Get single service by ID
   */
  async getServiceById(id: string | number): Promise<Service> {
    const response = await apiClient.get(`/services/${id}`);
    return (response.data.data || response.data) as Service;
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(categoryId: string | number): Promise<Service[]> {
    const response = await apiClient.get('/products', { 
      params: { categoryId } 
    });
    const data = (response.data.data || response.data) as Service[];
    return data.filter(item => 
      item.stock === 0 || 
      item.type === 'service'
    );
  }

  /**
   * Search services
   */
  async searchServices(keyword: string): Promise<Service[]> {
    const response = await apiClient.get('/products', { 
      params: { search: keyword } 
    });
    const data = (response.data.data || response.data) as Service[];
    return data.filter(item => 
      item.stock === 0 || 
      item.type === 'service'
    );
  }
}

export const serviceService = new ServiceService();
export default serviceService;
