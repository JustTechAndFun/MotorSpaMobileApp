# MotorSpa Backend API

Backend REST API cho ứng dụng MotorSpa được xây dựng bằng NestJS framework.

## 📖 Mô tả

Backend API cung cấp các chức năng chính sau:
- **Authentication & Authorization**: Đăng ký, đăng nhập với JWT
- **User Management**: Quản lý người dùng với phân quyền (admin, customer, staff)
- **Motor Service Management**: Quản lý dịch vụ bảo dưỡng xe máy
- **Database**: PostgreSQL với TypeORM
- **API Documentation**: Swagger UI tự động tại root endpoint

## 🛠️ Công nghệ sử dụng

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL với TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## 📋 Yêu cầu hệ thống

- Node.js >= 22.x
- PostgreSQL >= 12.x
- npm hoặc yarn

## ⚙️ Cài đặt

```bash
# Cài đặt dependencies
$ npm install
```

## 🔧 Cấu hình môi trường

Tạo file `.env` trong thư mục BACKEND với nội dung sau:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=motorspa

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=1d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:19006

# Swagger
SWAGGER_TITLE=MotorSpa API
SWAGGER_DESCRIPTION=API Documentation for MotorSpa Mobile App
SWAGGER_VERSION=1.0
```

## 🚀 Chạy ứng dụng

```bash
# Development mode
$ npm run start

# Development mode với watch (tự động reload)
$ npm run start:dev

# Production mode
$ npm run start:prod

# Debug mode
$ npm run start:debug
```

Server sẽ chạy tại: `http://localhost:3000`
Swagger documentation: `http://localhost:3000/`

## 🧪 Chạy tests

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov

# Watch mode
$ npm run test:watch
```

## 📁 Cấu trúc dự án

```
BACKEND/
├── src/
│   ├── auth/                    # Module xác thực
│   │   ├── decorators/          # Custom decorators
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── guards/              # Auth guards
│   │   └── strategies/          # JWT strategy
│   ├── common/                  # Shared utilities
│   │   ├── dto/                 # Common DTOs
│   │   ├── filters/             # Exception filters
│   │   └── interceptors/        # Response interceptors
│   ├── database/                # Database configuration
│   ├── motor_service/           # Motor service module
│   │   ├── dto/                 # DTOs
│   │   └── entities/            # TypeORM entities
│   ├── user/                    # User module
│   │   ├── dto/                 # DTOs
│   │   └── entities/            # TypeORM entities
│   ├── app.module.ts            # Root module
│   ├── app.controller.ts        # Root controller
│   ├── app.service.ts           # Root service
│   └── main.ts                  # Application entry point
├── test/                        # E2E tests
├── .env                         # Environment variables
└── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký tài khoản mới
- `POST /auth/login` - Đăng nhập

### Users
- `GET /users` - Lấy danh sách người dùng (Admin only)
- `GET /users/:id` - Lấy thông tin người dùng
- `PATCH /users/:id` - Cập nhật người dùng
- `DELETE /users/:id` - Xóa người dùng (Admin only)

### Motor Services
- `GET /motor-service` - Lấy danh sách dịch vụ
- `GET /motor-service/:id` - Lấy chi tiết dịch vụ
- `POST /motor-service` - Tạo dịch vụ mới (Staff/Admin)
- `PATCH /motor-service/:id` - Cập nhật dịch vụ (Staff/Admin)
- `DELETE /motor-service/:id` - Xóa dịch vụ (Admin only)

## 🏗️ Build

```bash
# Build production
$ npm run build

# Format code
$ npm run format

# Lint code
$ npm run lint
```

## 🚀 Deployment

```bash
# Build ứng dụng
$ npm run build

# Chạy production build
$ npm run start:prod
```

**Lưu ý**: 
- Đảm bảo cấu hình database production trong `.env`
- Đặt `synchronize: false` trong TypeORM và sử dụng migrations
- Cấu hình CORS phù hợp với domain của bạn
- Sử dụng biến môi trường bảo mật cho JWT_SECRET

## 📚 Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Swagger/OpenAPI](https://swagger.io)

## 📝 License

UNLICENSED - Private project
