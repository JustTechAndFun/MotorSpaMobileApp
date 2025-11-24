# MotorSpa Mobile App

Ứng dụng di động Motor Spa với kiến trúc fullstack bao gồm:
- **Backend**: NestJS (Node.js framework) với PostgreSQL
- **Frontend**: React Native với Expo

## Tính năng chính

- **Authentication**: Đăng ký, đăng nhập với JWT
- **User Management**: Quản lý người dùng với phân quyền (admin, customer, staff)
- **Motor Service**: Quản lý dịch vụ bảo dưỡng xe máy
- **Cross-platform**: Chạy trên iOS, Android và Web
- **API Documentation**: Swagger UI tự động
- **Real-time Updates**: TypeORM với PostgreSQL

## Yêu cầu hệ thống

- Node.js >= 22.x
- PostgreSQL >= 12.x
- npm hoặc yarn
- Git
- Android Studio (cho Android development)
- Xcode (cho iOS development - chỉ trên macOS)

## Cài đặt và chạy dự án

### 1. Cài đặt Node.js 22

```bash
# Sử dụng nvm để cài đặt Node.js 22
nvm install 22
nvm use 22

# Kiểm tra phiên bản
node --version  # Phải >= v22.x.x
npm --version
```

### 2. Clone và cài đặt dự án

```bash
git clone <repository-url>
cd MotorSpaMobileApp
```

### 3. Cài đặt Backend (NestJS)

```bash
cd BACKEND

# Cài đặt dependencies
npm install

# Tạo file .env (xem phần Cấu hình môi trường)
cp .env.example .env  # Hoặc tạo file .env thủ công

# Chạy backend ở chế độ development
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`
Swagger API docs: `http://localhost:3000/`

### 4. Cài đặt Frontend (React Native với Expo)

```bash
cd FRONTEND

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npx expo start
```

## Chạy ứng dụng Mobile

Sau khi chạy `npx expo start`, bạn có thể:

### Android
```bash
cd FRONTEND
npx expo start --android
# Hoặc nhấn 'a' trong terminal
```

### iOS (chỉ trên macOS)
```bash
cd FRONTEND
npx expo start --ios
# Hoặc nhấn 'i' trong terminal
```

### Web
```bash
cd FRONTEND
npx expo start --web
# Hoặc nhấn 'w' trong terminal
```

### Thiết bị thật với Expo Go
1. Tải app **Expo Go** từ App Store hoặc Google Play
2. Quét QR code hiển thị trong terminal

## Scripts hữu ích

### Backend Scripts
```bash
cd BACKEND

# Development mode với auto-reload
npm run start:dev

# Production mode
npm run start:prod

# Build
npm run build

# Chạy tests
npm run test

# Test coverage
npm run test:cov

# Lint & format code
npm run lint
npm run format
```

### Frontend Scripts
```bash
cd FRONTEND

# Khởi động development server
npx expo start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên web
npm run web

# Lint code
npm run lint

# Reset project (xóa code mẫu)
npm run reset-project
```

## Cấu trúc dự án

```
MotorSpaMobileApp/
├── BACKEND/                        # NestJS Backend API
│   ├── src/
│   │   ├── auth/                   # Authentication module (JWT)
│   │   │   ├── decorators/         # Custom decorators
│   │   │   ├── dto/                # Login/Register DTOs
│   │   │   ├── guards/             # JWT & Roles guards
│   │   │   └── strategies/         # JWT strategy
│   │   ├── common/                 # Shared utilities
│   │   │   ├── dto/                # Common DTOs
│   │   │   ├── filters/            # Exception filters
│   │   │   └── interceptors/       # Response interceptors
│   │   ├── database/               # Database configuration
│   │   ├── motor_service/          # Motor service module
│   │   │   ├── dto/                # Service DTOs
│   │   │   ├── entities/           # TypeORM entities
│   │   │   ├── motor_service.controller.ts
│   │   │   ├── motor_service.service.ts
│   │   │   └── motor_service.module.ts
│   │   ├── user/                   # User management module
│   │   │   ├── dto/                # User DTOs
│   │   │   ├── entities/           # User entity
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.module.ts
│   │   ├── app.module.ts           # Root module
│   │   └── main.ts                 # Entry point
│   ├── test/                       # E2E tests
│   ├── .env                        # Environment variables
│   └── package.json
├── FRONTEND/                       # React Native with Expo
│   ├── app/                        # Expo Router pages
│   │   ├── (tabs)/                 # Tab navigation screens
│   │   ├── _layout.tsx             # Root layout
│   │   └── modal.tsx               # Modal screen
│   ├── assets/                     # Images, fonts
│   ├── components/                 # Reusable components
│   ├── constants/                  # App constants
│   ├── hooks/                      # Custom hooks
│   ├── app.json                    # Expo config
│   └── package.json
└── README.md                       # This file
```

## Cấu hình môi trường

### Backend Environment Variables
Tạo file `.env` trong folder `BACKEND/`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=motorspa

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRATION=1d

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:19006

# Swagger Documentation
SWAGGER_TITLE=MotorSpa API
SWAGGER_DESCRIPTION=API Documentation for MotorSpa Mobile App
SWAGGER_VERSION=1.0
```

### Frontend Environment Variables
Tạo file `.env` trong folder `FRONTEND` (optional):
```env
API_BASE_URL=http://localhost:3000
```

### Database Setup
```bash
# Cài đặt PostgreSQL nếu chưa có
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Tạo database
psql -U postgres
CREATE DATABASE motorspa;
\q
```

## Deployment

### Backend Deployment

1. **Build ứng dụng**
```bash
cd BACKEND
npm run build
```

2. **Cấu hình production environment**
   - Đặt `NODE_ENV=production`
   - Sử dụng database production
   - Đặt `synchronize: false` trong TypeORM
   - Sử dụng migrations thay vì auto-sync

3. **Chạy production**
```bash
npm run start:prod
```

### Frontend Deployment

#### Android (APK/AAB)
```bash
cd FRONTEND

# Cài đặt EAS CLI (nếu chưa có)
npm install -g eas-cli

# Đăng nhập Expo
eas login

# Cấu hình build (lần đầu)
eas build:configure

# Build APK cho testing
eas build --platform android --profile preview

# Build AAB cho Google Play Store
eas build --platform android --profile production
```

#### iOS (IPA)
```bash
cd FRONTEND

# Build cho TestFlight/App Store
eas build --platform ios --profile production
```

**Lưu ý**: 
- Cần tài khoản Expo (miễn phí)
- iOS build yêu cầu Apple Developer account ($99/năm)
- Chi tiết: [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập

### Users (Protected)
- `GET /users` - Lấy danh sách users (Admin only)
- `GET /users/:id` - Lấy thông tin user
- `PATCH /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user (Admin only)

### Motor Services
- `GET /motor-service` - Lấy danh sách dịch vụ
- `GET /motor-service/:id` - Chi tiết dịch vụ
- `POST /motor-service` - Tạo dịch vụ (Staff/Admin)
- `PATCH /motor-service/:id` - Cập nhật dịch vụ (Staff/Admin)
- `DELETE /motor-service/:id` - Xóa dịch vụ (Admin only)

**Swagger UI**: `http://localhost:3000/` (khi backend đang chạy)

## Testing

### Backend Tests
```bash
cd BACKEND

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd FRONTEND

# Lint
npm run lint
```
