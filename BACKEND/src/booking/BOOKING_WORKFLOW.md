# Booking Workflow - Khách hàng đặt lịch với Motor Services

## Tổng quan
Workflow mới cho phép khách hàng **chọn nhiều motor services ngay khi tạo booking** thông qua một lần gọi API POST `/bookings`.

---

## 📋 Flow nghiệp vụ

### 1. **Khách hàng xem danh sách dịch vụ**
```
GET /motor-services
```
**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "Thay dầu động cơ",
    "price": 150000,
    "description": "Thay dầu nhớt cao cấp",
    "serviceType": "MAINTENANCE",
    "vehicleType": "ALL",
    "estimatedDuration": 30
  },
  {
    "id": "uuid-2", 
    "name": "Vệ sinh kim phun",
    "price": 200000,
    "serviceType": "CLEANING",
    "estimatedDuration": 45
  }
]
```

### 2. **Khách hàng tạo booking với các dịch vụ đã chọn**
```
POST /bookings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "locationId": "550e8400-e29b-41d4-a716-446655440000",
  "bookingDate": "2026-01-10T10:00:00Z",
  "services": [
    {
      "serviceId": "uuid-1",
      "quantity": 1,
      "notes": "Sử dụng dầu tổng hợp"
    },
    {
      "serviceId": "uuid-2",
      "quantity": 1
    }
  ],
  "notes": "Xe Honda Wave Alpha"
}
```

**Response:**
```json
{
  "id": "booking-uuid",
  "userId": "user-uuid",
  "locationId": "550e8400-e29b-41d4-a716-446655440000",
  "bookingDate": "2026-01-10T10:00:00.000Z",
  "status": "PENDING",
  "totalAmount": 350000,
  "isPaid": false,
  "notes": "Xe Honda Wave Alpha",
  "createdAt": "2026-01-06T...",
  "updatedAt": "2026-01-06T..."
}
```

### 3. **Xem chi tiết booking với danh sách dịch vụ**
```
GET /bookings/:id/with-services
```

**Response:**
```json
{
  "id": "booking-uuid",
  "userId": "user-uuid",
  "locationId": "location-uuid",
  "bookingDate": "2026-01-10T10:00:00.000Z",
  "status": "PENDING",
  "totalAmount": 350000,
  "isPaid": false,
  "bookingServices": [
    {
      "id": "bs-uuid-1",
      "productId": "product-uuid-1",
      "quantity": 1,
      "unitPrice": 150000,
      "totalPrice": 150000,
      "notes": "Sử dụng dầu tổng hợp",
      "product": {
        "id": "product-uuid-1",
        "name": "Thay dầu động cơ",
        "price": 150000,
        "category": {...}
      }
    },
    {
      "id": "bs-uuid-2",
      "productId": "product-uuid-2",
      "quantity": 1,
      "unitPrice": 200000,
      "totalPrice": 200000,
      "product": {
        "id": "product-uuid-2",
        "name": "Vệ sinh kim phun",
        "price": 200000
      }
    }
  ]
}
```

---

## 🔄 Backend Processing Flow

### **Khi POST /bookings được gọi:**

1. **Validate dữ liệu:**
   - Kiểm tra `services` array không rỗng
   - Validate từng service item (serviceId, quantity)

2. **Transaction bắt đầu:**
   - Tạo Booking với thông tin cơ bản
   - totalAmount = 0, isPaid = false, status = PENDING

3. **Xử lý từng service:**
   - Tìm service trong bảng `motor_services` hoặc `products`
   - Validate service còn available/active
   - Lấy giá (price) từ service
   - Nếu cần, tạo Product tương ứng từ MotorService
   - Tạo entry trong `booking_services`:
     - bookingId
     - productId
     - quantity
     - unitPrice
     - totalPrice = unitPrice * quantity
     - notes
   - Cộng dồn vào totalAmount

4. **Cập nhật Booking:**
   - Update booking.totalAmount = tổng của tất cả services

5. **Transaction commit:**
   - Nếu thành công → trả về booking
   - Nếu lỗi → rollback toàn bộ

---

## 📊 Database Schema

### **Relationships:**
```
User (1) ──→ (N) Booking
Location (1) ──→ (N) Booking
Booking (1) ──→ (N) BookingService
Product (1) ──→ (N) BookingService
MotorService (1) ──→ (0/1) Product (auto-created if needed)
```

### **booking_services (Junction Table):**
```typescript
{
  id: UUID (PK)
  bookingId: UUID (FK → bookings)
  productId: UUID (FK → products)
  quantity: number
  unitPrice: decimal
  totalPrice: decimal
  notes: string?
  isPaid: boolean
  createdAt: timestamp
}
```

---

## ✅ Ưu điểm của workflow mới

1. **UX tốt hơn:** Khách hàng chỉ cần gọi 1 API để đặt lịch + chọn dịch vụ
2. **Data consistency:** Sử dụng transaction đảm bảo dữ liệu nhất quán
3. **Tính toán tự động:** totalAmount được tính ngay khi tạo booking
4. **Flexible:** Hỗ trợ nhiều services, mỗi service có quantity và notes riêng
5. **Backward compatible:** API cũ (`/booking-services`) vẫn hoạt động nếu cần

---

## 🔐 Authorization & Validation

- **JWT Required:** Khách hàng phải đăng nhập
- **Services validation:** 
  - ServiceId phải tồn tại
  - Service phải còn active/available
  - Quantity >= 1
- **Transaction safety:** Rollback nếu có bất kỳ lỗi nào

---

## 🎯 Use Cases

### **Use Case 1: Đặt lịch thay dầu + vệ sinh xe**
```json
{
  "locationId": "loc-1",
  "bookingDate": "2026-01-15T09:00:00Z",
  "services": [
    { "serviceId": "motor-service-1", "quantity": 1 },
    { "serviceId": "motor-service-5", "quantity": 1 }
  ]
}
```

### **Use Case 2: Đặt nhiều lần cùng 1 dịch vụ**
```json
{
  "locationId": "loc-2",
  "bookingDate": "2026-01-20T14:00:00Z",
  "services": [
    { 
      "serviceId": "motor-service-3", 
      "quantity": 2,
      "notes": "Thay 2 lốp trước và sau" 
    }
  ]
}
```

---

## 🚀 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/bookings` | Tạo booking mới với services | ✅ JWT |
| GET | `/bookings/my-bookings` | Lấy bookings của user hiện tại | ✅ JWT |
| GET | `/bookings/:id` | Lấy thông tin booking | ✅ JWT |
| GET | `/bookings/:id/with-services` | Lấy booking + chi tiết services | ✅ JWT |
| PATCH | `/bookings/:id` | Cập nhật booking | ✅ JWT |
| DELETE | `/bookings/:id` | Xóa booking | ✅ JWT |

---

## 📝 Notes

- MotorService là master data (dịch vụ có sẵn)
- Product có thể được tạo tự động từ MotorService khi cần
- BookingService lưu snapshot của giá tại thời điểm booking (unitPrice)
- Nếu giá dịch vụ thay đổi sau này, booking cũ giữ nguyên giá cũ
