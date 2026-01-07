import apiClient from '../config/api.client';
import { ApiResponse, CreateMotorServiceRequest, MotorService, UpdateMotorServiceRequest } from '../types/api.types';

/**
 * Motor Service API
 * Các API liên quan đến dịch vụ xe máy
 */
class MotorServiceService {
  /**
   * Lấy danh sách tất cả motor services
   */
  async getServices(): Promise<MotorService[]> {
    const endpoint = '/motor-service';
    
    if (__DEV__) {
      console.log('🔧 Fetching motor services from:', endpoint);
    }
    
    const response = await apiClient.get<ApiResponse<MotorService[]>>(endpoint);
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy chi tiết một motor service
   */
  async getServiceById(serviceId: string): Promise<MotorService> {
    const response = await apiClient.get<ApiResponse<MotorService>>(
      `/motor-service/${serviceId}`
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Tạo motor service mới (Admin)
   */
  async createService(data: CreateMotorServiceRequest): Promise<MotorService> {
    if (__DEV__) {
      console.log('🔧 Creating motor service:', data);
    }
    
    const response = await apiClient.post<ApiResponse<MotorService>>(
      '/motor-service',
      data
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Cập nhật motor service (Admin)
   */
  async updateService(serviceId: string, data: UpdateMotorServiceRequest): Promise<MotorService> {
    if (__DEV__) {
      console.log('🔧 Updating motor service:', serviceId, data);
    }
    
    const response = await apiClient.patch<ApiResponse<MotorService>>(
      `/motor-service/${serviceId}`,
      data
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Xóa motor service (Admin)
   */
  async deleteService(serviceId: string): Promise<void> {
    if (__DEV__) {
      console.log('🔧 Deleting motor service:', serviceId);
    }
    
    await apiClient.delete(`/motor-service/${serviceId}`);
  }

  /**
   * Lấy services theo loại xe
   */
  async getServicesByVehicleType(vehicleType: string): Promise<MotorService[]> {
    const response = await apiClient.get<ApiResponse<MotorService[]>>(
      `/motor-service?vehicleType=${vehicleType}`
    );
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy services theo loại dịch vụ
   */
  async getServicesByServiceType(serviceType: string): Promise<MotorService[]> {
    const response = await apiClient.get<ApiResponse<MotorService[]>>(
      `/motor-service?serviceType=${serviceType}`
    );
    return (response.data as any).data || response.data;
  }
}

export const motorServiceService = new MotorServiceService();
