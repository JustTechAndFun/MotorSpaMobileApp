/**
 * Token Storage Utility
 * Quản lý lưu trữ và truy xuất tokens
 * TODO: Implement với AsyncStorage hoặc SecureStore cho persistence
 */

import { User } from '../types/api.types';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: number | null = null;
let userInfo: User | null = null;

/**
 * Decode JWT token để lấy payload
 */
export function decodeToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Lưu tokens
 */
export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  
  // Decode access token để lấy thời gian hết hạn
  const decoded = decodeToken(access);
  if (decoded && decoded.exp) {
    tokenExpiry = decoded.exp * 1000; // Convert to milliseconds
  }
  
  // TODO: Lưu vào AsyncStorage/SecureStore
  if (__DEV__) {
    console.log('🔐 Tokens saved:', {
      accessToken: access.substring(0, 20) + '...',
      refreshToken: refresh.substring(0, 20) + '...',
      expiresAt: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
    });
  }
}

/**
 * Lấy access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Lấy refresh token
 */
export function getRefreshToken(): string | null {
  return refreshToken;
}

/**
 * Kiểm tra access token có hết hạn không
 */
export function isAccessTokenExpired(): boolean {
  if (!tokenExpiry) return true;
  
  // Check với buffer 5 phút
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  
  return now >= (tokenExpiry - bufferTime);
}

/**
 * Lưu thông tin user
 */
export function setUser(user: User): void {
  userInfo = user;
  
  // TODO: Lưu vào AsyncStorage/SecureStore
  if (__DEV__) {
    console.log('👤 User info saved:', user);
  }
}

/**
 * Lấy thông tin user
 */
export function getUser(): User | null {
  return userInfo;
}

/**
 * Xóa tokens
 */
export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  tokenExpiry = null;
  userInfo = null;
  
  // TODO: Xóa từ AsyncStorage/SecureStore
  if (__DEV__) {
    console.log('🗑️ Tokens cleared');
  }
}

/**
 * Load tokens từ storage (gọi khi app khởi động)
 * TODO: Implement
 */
export async function loadTokens(): Promise<boolean> {
  // TODO: Load từ AsyncStorage/SecureStore
  // const stored = await AsyncStorage.getItem('tokens');
  // if (stored) {
  //   const { access, refresh } = JSON.parse(stored);
  //   setTokens(access, refresh);
  //   return true;
  // }
  return false;
}

/**
 * Get token info for debugging
 */
export function getTokenInfo(): {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  isExpired: boolean;
  expiresAt: string | null;
  timeUntilExpiry: number | null;
} {
  const now = Date.now();
  const timeUntilExpiry = tokenExpiry ? tokenExpiry - now : null;
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    isExpired: isAccessTokenExpired(),
    expiresAt: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
    timeUntilExpiry: timeUntilExpiry && timeUntilExpiry > 0 ? timeUntilExpiry : null,
  };
}
