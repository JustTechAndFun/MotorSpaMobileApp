import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { API_CONFIG } from './api.config';
import { getRefreshToken } from './token.storage';

/**
 * API Client
 * Axios instance được cấu hình với interceptors
 */
class ApiClient {
  private instance: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request và response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Thêm access token vào header nếu có
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        // Log request trong development mode
        if (__DEV__) {
          console.log('📤 API Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Log response trong development mode
        if (__DEV__) {
          console.log('📥 API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
          });
        }

        // Kiểm tra nếu response có error flag
        if (response.data && response.data.error === true) {
          const errorMessage = response.data.message || 'Đã có lỗi xảy ra';
          return Promise.reject(new Error(errorMessage));
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Log error trong development mode
        if (__DEV__) {
          console.error('❌ Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Handle 401 Unauthorized - Refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Lấy refresh token
            const refreshToken = getRefreshToken();
            
            if (!refreshToken) {
              // Không có refresh token, logout
              this.clearAccessToken();
              throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            }

            // Gọi API refresh token
            const response = await this.instance.post('/auth/refresh', {
              refreshToken
            });

            if (response.data && !response.data.error) {
              const newAccessToken = response.data.data.accessToken;
              
              // Cập nhật token mới
              this.setAccessToken(newAccessToken);
              
              // Import dynamically để tránh circular dependency
              const { setTokens } = await import('./token.storage');
              setTokens(newAccessToken, response.data.data.refreshToken || refreshToken);
              
              // Retry request gốc với token mới
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return this.instance(originalRequest);
            } else {
              throw new Error('Refresh token failed');
            }
            
          } catch (refreshError) {
            // Refresh token thất bại, đăng xuất user
            this.clearAccessToken();
            const { clearTokens } = await import('./token.storage');
            clearTokens();
            
            if (__DEV__) {
              console.error('❌ Refresh token failed:', refreshError);
            }
            
            // Redirect về login screen
            setTimeout(() => {
              try {
                router.replace('/login');
              } catch (navError) {
                console.error('Navigation error:', navError);
              }
            }, 100);
            
            return Promise.reject(new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
          }
        }

        // Handle các error status khác
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Xử lý error và trả về message thân thiện
   */
  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server trả về response với status code ngoài 2xx
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          return new Error(data?.message || 'Yêu cầu không hợp lệ');
        case 401:
          return new Error(data?.message || 'Phiên đăng nhập hết hạn');
        case 403:
          return new Error(data?.message || 'Bạn không có quyền truy cập');
        case 404:
          return new Error(data?.message || 'Không tìm thấy dữ liệu');
        case 500:
          return new Error(data?.message || 'Lỗi server, vui lòng thử lại sau');
        default:
          return new Error(data?.message || 'Đã có lỗi xảy ra');
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      return new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
    } else {
      // Lỗi xảy ra khi setup request
      return new Error(error.message || 'Đã có lỗi xảy ra');
    }
  }

  /**
   * Set access token
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear access token
   */
  public clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file
   */
  public async upload<T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<T> {
    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
