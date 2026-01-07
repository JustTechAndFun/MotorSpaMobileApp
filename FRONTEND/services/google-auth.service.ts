import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

/**
 * Google Auth Configuration Service
 * Cấu hình và quản lý Google Sign-In
 */
class GoogleAuthService {
  private initialized = false;

  /**
   * Khởi tạo Google Sign-In với Web Client ID
   * @param webClientId - Web Client ID từ Google Cloud Console
   */
  configure() {
    if (this.initialized) {
      return;
    }

    const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
    
    if (!webClientId) {
      throw new Error('GOOGLE_WEB_CLIENT_ID not configured in .env');
    }

    GoogleSignin.configure({
      webClientId,
      offlineAccess: true, 
      forceCodeForRefreshToken: true,
    });

    this.initialized = true;
  }

  /**
   * Kiểm tra xem đã khởi tạo chưa
   */
  isConfigured(): boolean {
    return this.initialized;
  }

  /**
   * Đăng nhập với Google
   * @returns Google ID Token để gửi lên backend
   */
  async signIn(): Promise<string> {
    try {
      // Kiểm tra xem đã có Google Play Services chưa
      await GoogleSignin.hasPlayServices();

      // Đăng nhập và lấy user info + tokens
      const response = await GoogleSignin.signIn();

      // ID Token có sẵn trong response
      const idToken = response.data?.idToken;
      
      if (!idToken) {
        throw new Error('Unable to get ID Token from Google');
      }

      return idToken;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw this.handleGoogleError(error);
    }
  }

  /**
   * Đăng xuất Google
   */
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  }

  /**
   * Kiểm tra xem user đã đăng nhập Google chưa
   */
  async isSignedIn(): Promise<boolean> {
    try {
      const user = await GoogleSignin.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lấy thông tin user hiện tại (nếu đã đăng nhập)
   */
  async getCurrentUser() {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      return null;
    }
  }

  /**
   * Xử lý lỗi từ Google Sign-In
   */
  private handleGoogleError(error: any): Error {
    const statusCodes = {
      SIGN_IN_CANCELLED: 'User cancelled the sign-in',
      IN_PROGRESS: 'Sign-in is in progress',
      PLAY_SERVICES_NOT_AVAILABLE: 'Google Play Services not available',
    };

    const message = statusCodes[error.code as keyof typeof statusCodes] || error.message || 'Google sign-in error';
    return new Error(message);
  }
}

export const googleAuthService = new GoogleAuthService();
export default googleAuthService;
