import apiClient from '../config/api.client';
import { API_ENDPOINTS } from '../config/api.config';
import {
  ApiResponse,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/api.types';

/**
 * Category Service
 * Các API liên quan đến danh mục
 */
class CategoryService {
  /**
   * Lấy danh sách danh mục
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      API_ENDPOINTS.CATEGORIES.LIST
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy danh sách active categories
   */
  async getActiveCategories(): Promise<Category[]> {
    if (__DEV__) {
      console.log('📁 Fetching active categories');
    }
    
    const response = await apiClient.get<ApiResponse<Category[]>>(
      '/categories/active'
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy danh sách root categories
   */
  async getRootCategories(): Promise<Category[]> {
    if (__DEV__) {
      console.log('📁 Fetching root categories');
    }
    
    const response = await apiClient.get<ApiResponse<Category[]>>(
      '/categories/root'
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy danh sách children của một parent category
   */
  async getCategoriesByParent(parentId: string | number): Promise<Category[]> {
    if (__DEV__) {
      console.log('📁 Fetching categories by parent:', parentId);
    }
    
    const response = await apiClient.get<ApiResponse<Category[]>>(
      `/categories/parent/${parentId}`
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy chi tiết danh mục by ID
   */
  async getCategoryById(categoryId: string | number): Promise<Category> {
    if (__DEV__) {
      console.log('📁 Fetching category by ID:', categoryId);
    }
    
    const response = await apiClient.get<ApiResponse<Category>>(
      `/categories/${categoryId}`
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy chi tiết danh mục (legacy method for backward compatibility)
   */
  async getCategoryDetail(categoryId: string | number): Promise<Category> {
    return this.getCategoryById(categoryId);
  }

  /**
   * Tạo danh mục mới (Admin)
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    if (__DEV__) {
      console.log('📁 Creating category:', data);
    }
    
    const response = await apiClient.post<ApiResponse<Category>>(
      '/categories',
      data
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Cập nhật danh mục (Admin)
   */
  async updateCategory(categoryId: string | number, data: UpdateCategoryRequest): Promise<Category> {
    if (__DEV__) {
      console.log('📁 Updating category:', categoryId, data);
    }
    
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/categories/${categoryId}`,
      data
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Xóa danh mục (Admin)
   */
  async deleteCategory(categoryId: string | number): Promise<void> {
    if (__DEV__) {
      console.log('📁 Deleting category:', categoryId);
    }
    
    await apiClient.delete(`/categories/${categoryId}`);
  }
}

export const categoryService = new CategoryService();
export default categoryService;
