import apiClient from '../config/api.client';
import { API_ENDPOINTS } from '../config/api.config';
import {
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    ApiResponse,
    UpdateProfileRequest,
    User
} from '../types/api.types';

/**
 * User Service
 * Các API liên quan đến user
 */
class UserService {
  /**
   * Lấy thông tin profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USER.PROFILE
    );
    return response.data;
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE(userId),
      data
    );
    return response.data;
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post<ApiResponse>(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(imageFile: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', imageFile);

    const response = await apiClient.upload<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.USER.UPLOAD_AVATAR,
      formData
    );
    
    return response.data.url;
  }

  // ============ ADMIN APIs ============
  
  /**
   * [ADMIN] Lấy tất cả users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.ADMIN.GET_ALL_USERS
    );
    return response.data;
  }

  /**
   * [ADMIN] Tạo user mới
   */
  async adminCreateUser(data: AdminCreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.CREATE_USER,
      data
    );
    return response.data;
  }

  /**
   * [ADMIN] Cập nhật thông tin user
   */
  async adminUpdateUser(userId: string, data: AdminUpdateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.ADMIN.UPDATE_USER,
      data
    );
    return response.data;
  }

  /**
   * [ADMIN] Xóa user
   */
  async adminDeleteUser(userId: string): Promise<void> {
    await apiClient.delete<ApiResponse>(
      API_ENDPOINTS.ADMIN.DELETE_USER(userId)
    );
  }
}

export const userService = new UserService();
export default userService;
