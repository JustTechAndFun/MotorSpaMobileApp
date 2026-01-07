import apiClient from '@/config/api.client';
import { getAccessToken, getTokenInfo, getUser, loadTokens, setUser as saveUserToStorage } from '@/config/token.storage';
import { authService, userService } from '@/services';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api.types';
import { useCallback, useEffect, useState } from 'react';

/**
 * useAuth Hook
 * Hook để quản lý authentication state và các thao tác liên quan
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Login
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('✅ Đăng nhập thành công:', response.user);
      
      // TODO: Lưu token và user vào AsyncStorage/SecureStore
      // await AsyncStorage.setItem('user', JSON.stringify(response.user));
      // await AsyncStorage.setItem('accessToken', response.accessToken);
      // await AsyncStorage.setItem('refreshToken', response.refreshToken);
      
      return true;
      
    } catch (err: any) {
      console.error('❌ Lỗi đăng nhập:', err);
      setError(err.message || 'Đăng nhập thất bại');
      setIsAuthenticated(false);
      return false;
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register
   */
  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authService.register(userData);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('✅ Đăng ký thành công:', response.user);
      
      // TODO: Lưu token và user vào AsyncStorage/SecureStore
      
      return true;
      
    } catch (err: any) {
      console.error('❌ Lỗi đăng ký:', err);
      setError(err.message || 'Đăng ký thất bại');
      setIsAuthenticated(false);
      return false;
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Đăng xuất thành công');
      
      // TODO: Xóa token và user từ AsyncStorage/SecureStore
      // await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
      
    } catch (err: any) {
      console.error('❌ Lỗi đăng xuất:', err);
      // Vẫn clear local state dù có lỗi
      setUser(null);
      setIsAuthenticated(false);
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Forgot Password
   */
  const forgotPassword = useCallback(async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API với phone thay vì email
      await authService.forgotPassword(phone);
      
      console.log('✅ Đã gửi yêu cầu reset mật khẩu');
      return true;
      
    } catch (err: any) {
      console.error('❌ Lỗi quên mật khẩu:', err);
      setError(err.message || 'Gửi yêu cầu thất bại');
      return false;
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update Profile
   */
  const updateProfile = useCallback(async (data: { name?: string; email?: string }): Promise<boolean> => {
    if (!user || !user.id) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await userService.updateProfile(user.id, data);
      
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      
      console.log('✅ Profile updated:', updatedUser);
      return true;
      
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return false;
      
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Clear Error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if user is authenticated on mount
   * Load tokens từ storage nếu có
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Load tokens từ storage
        const hasTokens = await loadTokens();
        
        // Load user info từ storage
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          console.log('✅ User loaded from storage:', storedUser);
        }
        
        if (hasTokens) {
          const tokenInfo = getTokenInfo();
          const token = getAccessToken();
          
          if (token && !tokenInfo.isExpired) {
            // Token còn hạn, set vào API client
            apiClient.setAccessToken(token);
            setIsAuthenticated(true);
            
            // TODO: Fetch user profile
            // const userProfile = await userService.getProfile();
            // setUser(userProfile);
            
            if (__DEV__) {
              console.log('✅ Tokens loaded from storage:', tokenInfo);
            }
          } else {
            if (__DEV__) {
              console.log('⚠️ Token expired, need to refresh or login');
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();
  }, []);

  /**
   * Kiểm tra xem user có phải là admin không
   */
  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    clearError,
  };
}

export default useAuth;
