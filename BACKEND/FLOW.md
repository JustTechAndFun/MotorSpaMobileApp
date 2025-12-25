# Flow Đăng Nhập Google cho Mobile App

## Tổng quan
Backend hỗ trợ 2 phương thức đăng nhập Google:
1. **Web OAuth Flow** - Dùng cho web browser (có sẵn)
2. **Mobile Google Sign-In** - Dùng cho ứng dụng di động (vừa thêm)

---

## Flow 1: Web OAuth (Google Redirect)

### Sơ đồ:
```
User → Frontend → Backend → Google → Backend → Frontend → User
```

### Chi tiết:
1. **User click "Login with Google"** trên web
2. Frontend redirect đến: `GET /auth/google`
3. Backend redirect user đến Google OAuth consent screen
4. User đăng nhập và cho phép quyền
5. Google redirect về: `GET /auth/google/callback?code=...`
6. Backend:
   - Nhận authorization code từ Google
   - Exchange code để lấy user profile
   - Tạo/cập nhật user trong database
   - Generate JWT tokens (accessToken, refreshToken)
7. Backend trả về tokens cho frontend
8. Frontend lưu tokens và redirect user vào app

### Endpoint:
- `GET /auth/google` - Bắt đầu OAuth flow
- `GET /auth/google/callback` - Nhận callback từ Google

---

## Flow 2: Mobile Google Sign-In ⭐ (Mới)

### Sơ đồ:
```
Mobile App → Google SDK → Mobile App → Backend → Mobile App
```

---

## 🎯 HƯỚNG DẪN BACKEND (Chi tiết từng bước)

### Bước 1: Cài đặt thư viện cần thiết

```bash
cd BACKEND
npm install google-auth-library
```

### Bước 2: Tạo DTO để nhận ID Token

**Tạo file: `src/auth/dto/google-signin.dto.ts`**

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleSignInDto {
    @ApiProperty({ 
        description: 'Google ID Token from mobile app',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...' 
    })
    @IsString()
    @IsNotEmpty()
    idToken: string;
}
```

### Bước 3: Cập nhật Auth Controller

**File: `src/auth/auth.controller.ts`**

Thêm import:
```typescript
import { GoogleSignInDto } from './dto/google-signin.dto';
```

Thêm endpoint mới:
```typescript
@Post('google/mobile')
@ApiCreatedResponse({ description: 'Authenticate with Google ID Token from mobile app' })
@ApiBody({ type: GoogleSignInDto })
async googleMobileAuth(@Body() dto: GoogleSignInDto) {
    return this.auth.verifyGoogleToken(dto.idToken);
}
```

### Bước 4: Cập nhật Auth Service

**File: `src/auth/auth.service.ts`**

Thêm import:
```typescript
import { OAuth2Client } from 'google-auth-library';
```

Thêm method mới sau `googleLogin()`:
```typescript
async verifyGoogleToken(idToken: string) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId || clientId === 'your_google_client_id_here') {
        throw new UnauthorizedException('Google authentication is not configured');
    }

    const client = new OAuth2Client(clientId);
    
    try {
        // Verify ID Token với Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: clientId,
        });
        
        const payload = ticket.getPayload();
        if (!payload) {
            throw new UnauthorizedException('Invalid Google token');
        }

        // Lấy thông tin user từ token
        const googleProfile = {
            googleId: payload.sub,
            email: payload.email || '',
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            picture: payload.picture,
        };

        // Tạo hoặc cập nhật user và trả về tokens
        return await this.googleLogin(googleProfile);
    } catch (error) {
        throw new UnauthorizedException('Failed to verify Google token: ' + error.message);
    }
}
```

### Bước 5: Cấu hình Google Client ID

**File: `.env`**

```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

**Lấy GOOGLE_CLIENT_ID:**
1. Vào https://console.cloud.google.com/
2. Chọn project hoặc tạo mới
3. Enable Google+ API
4. Credentials → Create OAuth 2.0 Client ID (Web application)
5. Copy Client ID và paste vào .env

### Bước 6: Test Backend API

**Dùng Postman hoặc curl:**

```bash
POST http://localhost:3000/auth/google/mobile
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response mong đợi:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "role": "CUSTOMER"
  },
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

---

## 📱 HƯỚNG DẪN FRONTEND (React Native - Chi tiết từng bước)

### Bước 1: Cài đặt dependencies

```bash
cd FRONTEND
npm install @react-native-google-signin/google-signin
npm install @react-native-async-storage/async-storage
npm install axios  # Hoặc dùng fetch
```

**Cho iOS (nếu chạy iOS):**
```bash
cd ios
pod install
cd ..
```

### Bước 2: Cấu hình Google Sign-In

#### Android Configuration

**File: `android/app/build.gradle`**

Thêm vào dependencies:
```gradle
dependencies {
    // ...existing dependencies
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

#### iOS Configuration (nếu có)

**File: `ios/FRONTEND/Info.plist`**

Thêm:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID_REVERSED</string>
        </array>
    </dict>
</array>
```

### Bước 3: Tạo Auth Service

**Tạo file: `services/authService.ts`**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:3000'; // Android emulator
// const API_URL = 'http://localhost:3000'; // iOS simulator
// const API_URL = 'https://your-api.com'; // Production

class AuthService {
  // Đăng nhập với Google ID Token
  async loginWithGoogle(idToken: string) {
    try {
      const response = await fetch(`${API_URL}/auth/google/mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Lưu tokens và user info
      await this.saveTokens(data.accessToken, data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Lưu tokens
  async saveTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  }

  // Lấy access token
  async getAccessToken() {
    return await AsyncStorage.getItem('accessToken');
  }

  // Lấy user info
  async getUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Refresh tokens
  async refreshTokens() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      await this.saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      // Nếu refresh fail, logout user
      await this.logout();
      throw error;
    }
  }

  // Logout
  async logout() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }

  // API call với auto refresh
  async apiCall(endpoint: string, options: RequestInit = {}) {
    let accessToken = await this.getAccessToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Nếu 401, thử refresh token
    if (response.status === 401) {
      try {
        accessToken = await this.refreshTokens();
        
        // Retry request với token mới
        return await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }
}

export default new AuthService();
```

### Bước 4: Tạo Google Sign-In Hook

**Tạo file: `hooks/useGoogleSignIn.ts`**

```typescript
import { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import authService from '../services/authService';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Từ Google Cloud Console
  offlineAccess: false,
  forceCodeForRefreshToken: false,
});

export const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check Google Play Services
      await GoogleSignin.hasPlayServices();

      // 2. Sign in với Google
      const userInfo = await GoogleSignin.signIn();

      // 3. Lấy ID Token
      const idToken = userInfo.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // 4. Gửi ID Token đến backend
      const result = await authService.loginWithGoogle(idToken);

      // 5. Return user data
      return result;
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      
      let errorMessage = 'An error occurred during sign in';
      
      if (err.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign in was cancelled';
      } else if (err.code === 'IN_PROGRESS') {
        errorMessage = 'Sign in is already in progress';
      } else if (err.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services not available';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await authService.logout();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return { signIn, signOut, isLoading, error };
};
```

### Bước 5: Tạo Login Screen

**Tạo file: `screens/LoginScreen.tsx`**

```typescript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

export const LoginScreen = ({ navigation }: any) => {
  const { signIn, isLoading, error } = useGoogleSignIn();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn();
      
      // Hiển thị thông báo thành công
      Alert.alert(
        'Welcome!',
        `Hello ${result.user.name}`,
        [{ text: 'OK', onPress: () => navigation.replace('Home') }]
      );
    } catch (err) {
      // Error đã được handle trong hook
      Alert.alert('Login Failed', error || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to MotorSpa</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Image
                source={require('../assets/google-icon.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.buttonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Phone Login Button (existing) */}
        <TouchableOpacity
          style={styles.phoneButton}
          onPress={() => navigation.navigate('PhoneLogin')}
        >
          <Text style={styles.phoneButtonText}>Sign in with Phone</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
    width: '100%',
  },
  phoneButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#f44336',
    marginTop: 16,
    textAlign: 'center',
  },
});
```

### Bước 6: Tạo Home Screen (để test)

**Tạo file: `screens/HomeScreen.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import authService from '../services/authService';

export const HomeScreen = ({ navigation }: any) => {
  const { signOut } = useGoogleSignIn();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {user?.picture && (
          <Image
            source={{ uri: user.picture }}
            style={styles.avatar}
          />
        )}
        
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Role: {user?.role}</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Bước 7: Cập nhật Navigation

**File: `App.tsx` hoặc navigation file**

```typescript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import authService from './services/authService';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await authService.getAccessToken();
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Check login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Home' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Bước 8: Chạy app

```bash
# Android
npm run android

# iOS
npm run ios
```

### Bước 9: Test trên thiết bị thật

**Lưu ý quan trọng:**
- Google Sign-In **không hoạt động** trên emulator nếu chưa cài Google Play Services
- Nên test trên **thiết bị thật** với Google account đã đăng nhập
- Android: Enable USB Debugging và kết nối thiết bị
- iOS: Cần Apple Developer account để chạy trên thiết bị

**Debug trên Android thật:**
```bash
# Kiểm tra thiết bị
adb devices

# Chạy app
npm run android
```

---

## 🔍 FLOW HOÀN CHỈNH (Step by step)

### User Journey:

1. **User mở app** → App kiểm tra token trong AsyncStorage
   
2. **Nếu chưa login** → Hiển thị LoginScreen
   
3. **User click "Sign in with Google"**
   
4. **Google Sign-In SDK mở**
   - Hiển thị danh sách Google accounts trên thiết bị
   - Hoặc yêu cầu đăng nhập nếu chưa có
   
5. **User chọn account** → Google xác thực
   
6. **App nhận ID Token** từ Google SDK
   
7. **App gửi ID Token đến backend**: 
   ```
   POST /auth/google/mobile
   Body: { idToken: "..." }
   ```
   
8. **Backend verify token với Google**:
   - Gọi Google API để verify
   - Kiểm tra token hợp lệ, chưa expire
   - Lấy user info (email, name, picture)
   
9. **Backend tìm/tạo user**:
   - Tìm user theo googleId
   - Nếu không có, tìm theo email
   - Nếu vẫn không có, tạo user mới
   
10. **Backend generate JWT tokens**:
    - accessToken (expire: 25h)
    - refreshToken (expire: 90d)
    
11. **Backend trả về response**:
    ```json
    {
      "user": {...},
      "accessToken": "...",
      "refreshToken": "..."
    }
    ```
    
12. **App lưu tokens** vào AsyncStorage
    
13. **App navigate** đến HomeScreen
    
14. **User sử dụng app** với authenticated APIs:
    ```typescript
    const response = await authService.apiCall('/api/bookings', {
      method: 'GET'
    });
    ```
    
15. **Khi accessToken expire**:
    - authService tự động gọi `/auth/refresh`
    - Lấy tokens mới
    - Retry request ban đầu
    
16. **User logout**:
    - Xóa tokens khỏi AsyncStorage
    - Sign out khỏi Google (optional)
    - Navigate về LoginScreen

---

## ✅ CHECKLIST HOÀN THÀNH

### Backend:
- [x] Cài `google-auth-library`
- [x] Tạo `google-signin.dto.ts`
- [x] Thêm endpoint `POST /auth/google/mobile` trong controller
- [x] Thêm method `verifyGoogleToken()` trong service
- [x] Cấu hình `GOOGLE_CLIENT_ID` trong `.env`
- [ ] Test API với Postman

### Frontend:
- [ ] Cài `@react-native-google-signin/google-signin`
- [ ] Cài `@react-native-async-storage/async-storage`
- [ ] Cấu hình Android/iOS
- [ ] Tạo `authService.ts`
- [ ] Tạo `useGoogleSignIn.ts` hook
- [ ] Tạo `LoginScreen.tsx`
- [ ] Tạo `HomeScreen.tsx`
- [ ] Cập nhật navigation
- [ ] Test trên thiết bị thật

### Google Cloud Console:
- [ ] Tạo project
- [ ] Enable Google+ API
- [ ] Tạo OAuth 2.0 Client ID (Web)
- [ ] (Optional) Tạo Android Client ID
- [ ] (Optional) Tạo iOS Client ID
- [ ] Copy Client ID vào code

---

## 🐛 TROUBLESHOOTING

### Backend Issues:

**"Google authentication is not configured"**
- Kiểm tra `GOOGLE_CLIENT_ID` trong `.env`
- Đảm bảo không còn giá trị default `your_google_client_id_here`

**"Failed to verify Google token"**
- Token đã expire (token có thời hạn 1 giờ)
- Client ID không đúng
- Lấy token mới từ mobile app

### Frontend Issues:

**"DEVELOPER_ERROR"**
- `webClientId` không đúng trong `GoogleSignin.configure()`
- Phải dùng Web Client ID từ Google Cloud Console

**"SIGN_IN_REQUIRED"**
- User chưa đăng nhập Google trên thiết bị
- Yêu cầu user thêm Google account

**"Network request failed"**
- Backend chưa chạy
- Sai API_URL (dùng `10.0.2.2` cho Android emulator)
- Kiểm tra firewall/CORS

**Google Sign-In không hiện gì**
- Chưa cài Google Play Services (emulator)
- Test trên thiết bị thật

---

## 📝 LƯU Ý QUAN TRỌNG

1. **GOOGLE_CLIENT_ID**: Phải dùng **Web Client ID** cho backend verify, không phải Android/iOS Client ID

2. **API_URL**: 
   - Android Emulator: `http://10.0.2.2:3000`
   - iOS Simulator: `http://localhost:3000`
   - Thiết bị thật: `http://YOUR_IP:3000` hoặc domain

3. **Token Expiry**: 
   - Google ID Token expire sau 1 giờ
   - JWT accessToken expire sau 25 giờ
   - JWT refreshToken expire sau 90 ngày

4. **Production**: 
   - Bắt buộc dùng HTTPS
   - Cấu hình CORS đúng
   - Rate limiting cho auth endpoints

5. **Security**:
   - KHÔNG lưu password nếu user đăng nhập qua Google
   - Backend PHẢI verify token, không tin client
   - Encrypt tokens trong AsyncStorage nếu có thể
  offlineAccess: false,
});
```

#### Bước 2: User click "Login with Google" trong app
```javascript
const signInWithGoogle = async () => {
  try {
    // 1. Kiểm tra Google Play Services
    await GoogleSignin.hasPlayServices();
    
    // 2. Hiển thị Google Sign-In UI
    const userInfo = await GoogleSignin.signIn();
    
    // 3. Lấy ID Token
    const { idToken } = userInfo;
    
    // 4. Gửi ID Token đến backend
    const response = await fetch('https://your-api.com/auth/google/mobile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    // 5. Nhận tokens từ backend
    const { user, accessToken, refreshToken } = await response.json();
    
    // 6. Lưu tokens vào AsyncStorage
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    // 7. Navigate vào app
    navigation.navigate('Home');
    
  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
};
```

#### Bước 3: Backend xử lý (tự động)
Khi nhận POST request tại `/auth/google/mobile`:

1. **Nhận ID Token** từ request body
   ```typescript
   { idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6..." }
   ```

2. **Verify ID Token** với Google
   ```typescript
   const client = new OAuth2Client(GOOGLE_CLIENT_ID);
   const ticket = await client.verifyIdToken({
     idToken,
     audience: GOOGLE_CLIENT_ID,
   });
   ```

3. **Lấy thông tin user** từ verified token
   ```typescript
   const payload = ticket.getPayload();
   // payload chứa: sub (googleId), email, given_name, family_name, picture
   ```

4. **Tìm hoặc tạo user** trong database
   - Tìm user theo `googleId`
   - Nếu không có, tìm theo `email`
   - Nếu vẫn không có, tạo user mới
   - Cập nhật thông tin user (email, name, picture)

5. **Generate JWT tokens**
   - accessToken (expire: 25 giờ)
   - refreshToken (expire: 90 ngày)

6. **Trả về response**
   ```json
   {
     "user": {
       "id": "uuid",
       "email": "user@gmail.com",
       "name": "John Doe",
       "picture": "https://...",
       "role": "CUSTOMER"
     },
     "accessToken": "eyJhbGci...",
     "refreshToken": "eyJhbGci..."
   }
   ```

#### Bước 4: Sử dụng tokens cho API calls
```javascript
// Gọi protected APIs
const response = await fetch('https://your-api.com/api/bookings', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

#### Bước 5: Refresh tokens khi hết hạn
```javascript
const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  const response = await fetch('https://your-api.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
  
  await AsyncStorage.setItem('accessToken', newAccessToken);
  await AsyncStorage.setItem('refreshToken', newRefreshToken);
  
  return newAccessToken;
};
```

### Endpoint:
- `POST /auth/google/mobile` - Xác thực Google ID Token từ mobile app

---

## So sánh 2 flows

| Đặc điểm | Web OAuth | Mobile Google Sign-In |
|----------|-----------|----------------------|
| **Phù hợp với** | Web browsers | Mobile apps (iOS/Android) |
| **UI** | Redirect sang Google web | Native Google UI trong app |
| **Token** | Authorization code → exchange | ID Token trực tiếp |
| **Steps** | Nhiều redirects | 1 API call duy nhất |
| **User Experience** | Rời khỏi app | Ở trong app |
| **Bảo mật** | Server-to-server | Client verify, server double-check |

---

## Cấu hình Google Cloud Console

### Bước 1: Tạo OAuth 2.0 Client ID

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project hoặc tạo mới
3. Enable **Google+ API**
4. Vào **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**

### Bước 2: Tạo credentials cho từng platform

#### Web Client (cho Web OAuth):
- Application type: **Web application**
- Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
- Copy **Client ID** và **Client Secret**

#### Android Client (cho Mobile):
- Application type: **Android**
- Package name: `com.yourcompany.motorspa`
- SHA-1 certificate: (lấy từ keystore)

#### iOS Client (cho Mobile):
- Application type: **iOS**
- Bundle ID: `com.yourcompany.motorspa`

### Bước 3: Cập nhật .env
```env
# Sử dụng Web Client ID cho cả web và mobile
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

**Lưu ý**: Với mobile app, có thể dùng Web Client ID hoặc tạo riêng Android/iOS Client ID.

---

## Database Schema

### User Entity
```typescript
{
  id: string;              // UUID
  phone?: string;          // Cho đăng ký thông thường
  email?: string;          // Từ Google
  googleId?: string;       // Google User ID
  name: string;
  password?: string;       // Null nếu đăng nhập qua Google
  picture?: string;        // Avatar URL từ Google
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
  hashedRefreshToken?: string;  // Để refresh tokens
}
```

### Logic tạo/cập nhật user:
1. Tìm user theo `googleId`
2. Nếu không có, tìm theo `email` (trường hợp user đã đăng ký bằng phone trước đó)
3. Nếu tìm thấy: cập nhật `googleId`, `email`, `picture`
4. Nếu không tìm thấy: tạo user mới với role = CUSTOMER

---

## Security Considerations

### 1. ID Token Verification
- Backend PHẢI verify ID Token với Google (không tin tưởng client)
- Kiểm tra `audience` (phải match với GOOGLE_CLIENT_ID)
- Kiểm tra `issuer` (phải là accounts.google.com)
- Kiểm tra token chưa expire

### 2. Token Storage
- Mobile: Lưu tokens trong **AsyncStorage** (encrypted nếu có)
- KHÔNG lưu tokens trong localStorage cho web
- Xóa tokens khi logout

### 3. HTTPS
- Production PHẢI dùng HTTPS
- Google sẽ reject callbacks không phải HTTPS (trừ localhost)

### 4. Rate Limiting
- Implement rate limiting cho `/auth/google/mobile`
- Ngăn brute force attacks

---

## Testing

### Test với Postman:

1. **Lấy Google ID Token** từ [OAuth Playground](https://developers.google.com/oauthplayground/)
   - Select **Google OAuth2 API v2**
   - Authorize APIs
   - Exchange authorization code for tokens
   - Copy `id_token`

2. **Call API**:
   ```
   POST http://localhost:3000/auth/google/mobile
   Content-Type: application/json
   
   {
     "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
   }
   ```

3. **Verify response**:
   ```json
   {
     "user": {
       "id": "...",
       "email": "test@gmail.com",
       "name": "Test User",
       "role": "CUSTOMER"
     },
     "accessToken": "...",
     "refreshToken": "..."
   }
   ```

---

## Error Handling

### Các lỗi có thể gặp:

| Error | Nguyên nhân | Giải pháp |
|-------|-------------|-----------|
| `Google authentication is not configured` | GOOGLE_CLIENT_ID chưa set | Cập nhật .env |
| `Failed to verify Google token` | ID Token không hợp lệ | Kiểm tra token có đúng không |
| `Invalid Google token` | Token đã expire | Lấy token mới |
| `Audience mismatch` | Client ID không match | Đảm bảo dùng đúng Client ID |

### Example error response:
```json
{
  "statusCode": 401,
  "message": "Failed to verify Google token: Token used too late",
  "error": "Unauthorized"
}
```

---

## Frontend Implementation (React Native)

### Cài đặt packages:
```bash
npm install @react-native-google-signin/google-signin
npm install @react-native-async-storage/async-storage
```

### Component example:
```tsx
import React from 'react';
import { Button, View, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

GoogleSignin.configure({
  webClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
});

export const LoginScreen = ({ navigation }) => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const response = await fetch('https://your-api.com/auth/google/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: userInfo.idToken }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.multiSet([
          ['accessToken', data.accessToken],
          ['refreshToken', data.refreshToken],
          ['user', JSON.stringify(data.user)],
        ]);
        
        navigation.replace('Home');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };
  
  return (
    <View>
      <Button title="Sign in with Google" onPress={handleGoogleLogin} />
    </View>
  );
};
```

---

## Tổng kết

### Ưu điểm của Mobile Google Sign-In:
✅ User không cần rời khỏi app  
✅ Native UI, trải nghiệm tốt hơn  
✅ Nhanh hơn (1 API call thay vì nhiều redirects)  
✅ Tự động dùng Google account đã đăng nhập trên thiết bị  
✅ Hỗ trợ biometric authentication (fingerprint, Face ID)  

### Next steps:
1. ✅ Cấu hình GOOGLE_CLIENT_ID trong .env
2. ✅ Test endpoint `/auth/google/mobile` với Postman
3. ⏳ Implement Google Sign-In trong React Native app
4. ⏳ Test trên thiết bị thật (Android/iOS)
5. ⏳ Deploy backend lên production với HTTPS
