import apiClient from '../config/api.client';
import { API_ENDPOINTS } from '../config/api.config';
import { clearTokens, setTokens, setUser } from '../config/token.storage';
import {
  ApiResponse,
  AuthResponse,
  GoogleAuthRequest,
  LoginRequest,
  RegisterRequest,
} from '../types/api.types';

/**
 * Auth Service
 * Các API liên quan đến authentication
 */
class AuthService {
  /**
   * Đăng nhập
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Lưu access token và refresh token
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
      apiClient.setAccessToken(response.data.accessToken);
    }
    
    // Lưu thông tin user
    if (response.data.user) {
      setUser(response.data.user);
    }
    
    return response.data;
  }

  /**
   * Đăng ký
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    // Lưu access token và refresh token
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
      apiClient.setAccessToken(response.data.accessToken);
    }
    
    // Lưu thông tin user
    if (response.data.user) {
      setUser(response.data.user);
    }
    
    return response.data;
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear token dù API có lỗi hay không
      apiClient.clearAccessToken();
      clearTokens();
    }
  }

  /**
   * Quên mật khẩu
   */
  async forgotPassword(phone: string): Promise<void> {
    await apiClient.post<ApiResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      phone,
    });
  }

  /**
   * Reset mật khẩu
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post<ApiResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );
    
    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken;
    
    // Lưu tokens mới
    setTokens(newAccessToken, newRefreshToken);
    apiClient.setAccessToken(newAccessToken);
    
    return newAccessToken;
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      token,
    });
  }

  /**
   * Đăng nhập với Google (Mobile App)
   * @param idToken - Google ID Token từ Google Sign-In
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.GOOGLE_MOBILE,
      { idToken } as GoogleAuthRequest
    );

    // Lưu access token và refresh token
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
      apiClient.setAccessToken(response.data.accessToken);
    }

    // Lưu thông tin user
    if (response.data.user) {
      setUser(response.data.user);
    }

    return response.data;
  }
}

export const authService = new AuthService();
export default authService;
