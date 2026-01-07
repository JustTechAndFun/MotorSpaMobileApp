import { apiClient } from '../config/api.client';
import type {
  CreateProductRequest,
  Product,
  ProductListParams,
  UpdateProductRequest
} from '../types/api.types';

/**
 * Product Service
 * Handles all product-related API calls
 */
class ProductService {
  /**
   * Get all products with optional filters
   */
  async getProducts(params?: ProductListParams): Promise<Product[]> {
    const response = await apiClient.get('/products', { params });
    const data = (response.data.data || response.data) as Product[];
    // Filter out services (items with stock = 0 are services)
    return data.filter(item => 
      item.stock !== undefined && 
      item.stock > 0
    );
  }

  /**
   * Get all available products only
   */
  async getAvailableProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products/available');
    const data = (response.data.data || response.data) as Product[];
    // Filter out services (items with stock = 0 are services)
    return data.filter(item => 
      item.stock !== undefined && 
      item.stock > 0
    );
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string | number): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return (response.data.data || response.data) as Product;
  }

  /**
   * Create new product (Admin only)
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post('/products', data);
    return (response.data.data || response.data) as Product;
  }

  /**
   * Update existing product (Admin only)
   */
  async updateProduct(id: string | number, data: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.patch(`/products/${id}`, data);
    return (response.data.data || response.data) as Product;
  }

  /**
   * Delete product (Admin only)
   */
  async deleteProduct(id: string | number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  // Legacy methods for backward compatibility
  async getProductDetail(productId: string | number): Promise<Product> {
    return this.getProductById(productId);
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    const response = await apiClient.get('/products', { 
      params: { search: keyword } 
    });
    const data = (response.data.data || response.data) as Product[];
    // Filter out services (items with stock = 0 are services)
    return data.filter(item => 
      item.stock !== undefined && 
      item.stock > 0
    );
  }

  async getProductsByCategory(
    categoryId: string | number,
    subCategoryId?: string | number
  ): Promise<Product[]> {
    const response = await apiClient.get('/products', { 
      params: { categoryId, subCategoryId } 
    });
    const data = (response.data.data || response.data) as Product[];
    // Filter out services (items with stock = 0 are services)
    return data.filter(item => 
      item.stock !== undefined && 
      item.stock > 0
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    // Return available products as featured for now
    return this.getAvailableProducts();
  }
}

export const productService = new ProductService();
export default productService;
