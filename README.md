# MotorSpa Mobile App

Ứng dụng di động Motor Spa với kiến trúc fullstack bao gồm:
- **Backend**: NestJS (Node.js framework)
- **Frontend**: React Native với Expo

## 📋 Yêu cầu hệ thống

- Node.js >= 22.x
- npm hoặc yarn
- Git
- Android Studio (cho Android development)
- Xcode (cho iOS development - chỉ trên macOS)

## 🚀 Cài đặt và chạy dự án

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

# Cài đặt Nest CLI globally (nếu chưa có)
npm install -g @nestjs/cli

# Tạo dự án NestJS mới (nếu chưa có)
nest new . --package-manager npm

# Hoặc cài đặt dependencies nếu đã có
npm install

# Chạy backend ở chế độ development
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

### 4. Cài đặt Frontend (React Native với Expo)

```bash
cd FRONTEND

# Tạo ứng dụng Expo mới (nếu chưa có)
npx create-expo-app@latest .

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npx expo start
```

## 📱 Chạy ứng dụng Mobile

### Android
```bash
cd FRONTEND
npx expo start --android
```

### iOS (chỉ trên macOS)
```bash
cd FRONTEND
npx expo start --ios
```

### Web
```bash
cd FRONTEND
npx expo start --web
```

## 🛠️ Scripts hữu ích

### Backend Scripts
```bash
cd BACKEND

# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Chạy tests
npm run test

# Build
npm run build
```

### Frontend Scripts
```bash
cd FRONTEND

# Khởi động development server
npx expo start

# Chạy trên Android
npx expo start --android

# Chạy trên iOS
npx expo start --ios

# Chạy trên web
npx expo start --web

# Build cho production
npx expo build
```

## 📁 Cấu trúc dự án

```
MotorSpaMobileApp/
├── BACKEND/                 # NestJS Backend
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── package.json
│   └── ...
├── FRONTEND/               # React Native Frontend
│   ├── App.js
│   ├── package.json
│   └── ...
├── README.md
└── package.json           # Root package.json cho scripts chung
```

## 🔧 Cấu hình môi trường

### Backend Environment Variables
Tạo file `.env` trong folder `BACKEND/`:
```env
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### Frontend Environment Variables
Tạo file `.env` trong folder `FRONTEND`:
```env
API_BASE_URL=http://localhost:3000
```

## 🚀 Deployment

### Backend Deployment
```bash
cd BACKEND
npm run build
npm run start:prod
```

### Frontend Deployment
```bash
cd FRONTEND
npx expo build:android  # Cho Android
npx expo build:ios      # Cho iOS
```