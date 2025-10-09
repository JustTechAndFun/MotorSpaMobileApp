# MotorSpa Frontend Mobile App

Ứng dụng di động MotorSpa được xây dựng bằng React Native với Expo framework.

## 📖 Mô tả

Frontend mobile app cho dịch vụ bảo dưỡng xe máy với các tính năng:
- **Cross-platform**: Chạy trên iOS, Android và Web
- **Modern UI**: Sử dụng React Native và Expo Router
- **Authentication**: Đăng nhập/đăng ký người dùng
- **Service Management**: Xem và quản lý dịch vụ bảo dưỡng
- **Navigation**: File-based routing với Expo Router

## 🛠️ Công nghệ sử dụng

- **Framework**: React Native 0.81.x
- **Platform**: Expo SDK 54
- **Navigation**: Expo Router 6
- **Language**: TypeScript
- **UI Components**: Expo Vector Icons, React Native Reanimated

## 📋 Yêu cầu hệ thống

- Node.js >= 22.x
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android development)
- Xcode (cho iOS development - chỉ trên macOS)
- iOS Simulator hoặc Android Emulator hoặc thiết bị thật

## ⚙️ Cài đặt

1. Cài đặt dependencies

   ```bash
   npm install
   ```

2. Cấu hình môi trường (optional)

   Tạo file `.env` nếu cần:
   ```env
   API_BASE_URL=http://localhost:3000
   ```

## 🚀 Chạy ứng dụng

### Development Server

   ```bash
   npx expo start
   ```

Sau khi chạy lệnh trên, bạn có thể:

- Nhấn `a` để mở trên **Android emulator**
- Nhấn `i` để mở trên **iOS simulator** (chỉ macOS)
- Nhấn `w` để mở trên **Web browser**
- Quét QR code bằng app **Expo Go** trên điện thoại

### Chạy trên các platform cụ thể

```bash
# Android
npm run android
# hoặc: npx expo start --android

# iOS (chỉ trên macOS)
npm run ios
# hoặc: npx expo start --ios

# Web
npm run web
# hoặc: npx expo start --web
```

## 📁 Cấu trúc dự án

```
FRONTEND/
├── app/                         # Expo Router pages
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Home screen
│   │   └── explore.tsx          # Explore screen
│   ├── _layout.tsx              # Root layout
│   └── modal.tsx                # Modal screen
├── assets/                      # Static assets (images, fonts)
├── components/                  # Reusable components
├── constants/                   # App constants
├── hooks/                       # Custom React hooks
├── scripts/                     # Utility scripts
├── app.json                     # Expo configuration
├── package.json
└── tsconfig.json
```

## 🛠️ Scripts hữu ích

```bash
# Khởi động development server
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên Web
npm run web

# Lint code
npm run lint

# Reset project (xóa code mẫu)
npm run reset-project
```

## 🏗️ Build Production

### Android (APK/AAB)

```bash
# Build APK cho testing
npx eas build --platform android --profile preview

# Build AAB cho Google Play Store
npx eas build --platform android --profile production
```

### iOS (IPA)

```bash
# Build cho TestFlight/App Store
npx eas build --platform ios --profile production
```

**Lưu ý**: Để build production, bạn cần:
1. Tài khoản Expo (miễn phí)
2. Cài đặt EAS CLI: `npm install -g eas-cli`
3. Đăng nhập: `eas login`
4. Cấu hình project: `eas build:configure`

## 🧪 Testing

```bash
# Lint code
npm run lint
```

## 📱 Expo Go App

Để test nhanh trên thiết bị thật mà không cần build:

1. Tải **Expo Go** app từ:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Chạy `npx expo start`

3. Quét QR code hiển thị trên terminal

## 🔗 API Integration

Ứng dụng kết nối với backend API tại `http://localhost:3000` (development).

Các endpoints chính:
- Authentication: `/auth/login`, `/auth/register`
- Motor Services: `/motor-service`
- Users: `/users`

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction)

## 📝 License

UNLICENSED - Private project
