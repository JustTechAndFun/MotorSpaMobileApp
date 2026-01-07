import { apiClient } from '../config/api.client';
import {
  AddAddressRequest,
  Address,
  UpdateAddressRequest,
} from '../types/api.types';

/**
 * Address Service
 * Các API liên quan đến địa chỉ người dùng
 */
class AddressService {
  /**
   * Lấy danh sách địa chỉ
   */
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get('/user/addresses');
    return (response.data as any).data || response.data;
  }

  /**
   * Lấy chi tiết địa chỉ
   */
  async getAddressById(addressId: string | number): Promise<Address> {
    const response = await apiClient.get(`/user/addresses/${addressId}`);
    return (response.data as any).data || response.data;
  }

  /**
   * Thêm địa chỉ mới
   */
  async createAddress(data: AddAddressRequest): Promise<Address> {
    const response = await apiClient.post('/user/addresses', data);
    return (response.data as any).data || response.data;
  }

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(
    addressId: string | number,
    data: UpdateAddressRequest
  ): Promise<Address> {
    const response = await apiClient.patch(`/user/addresses/${addressId}`, data);
    return (response.data as any).data || response.data;
  }

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(addressId: string | number): Promise<void> {
    await apiClient.delete(`/user/addresses/${addressId}`);
  }

  /**
   * Đặt địa chỉ mặc định
   */
  async setDefaultAddress(addressId: string | number): Promise<Address> {
    return this.updateAddress(addressId, { isDefault: true });
  }
}

export const addressService = new AddressService();
