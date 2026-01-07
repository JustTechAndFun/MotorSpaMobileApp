import { apiClient } from '../config/api.client';
import {
    CreateStoreLocationRequest,
    StoreLocation,
    UpdateStoreLocationRequest,
} from '../types/api.types';

class LocationService {
  private readonly BASE_PATH = '/locations';

  /**
   * Get all store locations
   */
  async getLocations(): Promise<StoreLocation[]> {
    const response: any = await apiClient.get(this.BASE_PATH);
    return response.data.data || response.data;
  }

  /**
   * Get all active store locations
   */
  async getActiveLocations(): Promise<StoreLocation[]> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/active`);
    return response.data.data || response.data;
  }

  /**
   * Find nearest locations
   */
  async getNearestLocations(
    latitude: number,
    longitude: number,
    limit: number = 5
  ): Promise<StoreLocation[]> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/nearest/find`, {
      params: { lat: latitude, lng: longitude, limit },
    });
    return response.data.data || response.data;
  }

  /**
   * Get location by ID
   */
  async getLocationById(id: string): Promise<StoreLocation> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return response.data.data || response.data;
  }

  /**
   * Create new location (Admin only)
   */
  async createLocation(data: CreateStoreLocationRequest): Promise<StoreLocation> {
    const response: any = await apiClient.post(this.BASE_PATH, data);
    return response.data.data || response.data;
  }

  /**
   * Update location (Admin only)
   */
  async updateLocation(
    id: string,
    data: UpdateStoreLocationRequest
  ): Promise<StoreLocation> {
    const response: any = await apiClient.patch(`${this.BASE_PATH}/${id}`, data);
    return response.data.data || response.data;
  }

  /**
   * Delete location (Admin only)
   */
  async deleteLocation(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const locationService = new LocationService();
