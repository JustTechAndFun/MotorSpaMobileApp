# MotorSpa Backend - New Features Documentation

## Tổng quan các tính năng mới

Đã implement thành công các tính năng sau:

### 1. **Change Password** ✅
- Endpoint: `POST /user/change-password`
- User có thể đổi mật khẩu (không áp dụng cho tài khoản đăng ký qua Google)

### 2. **User Address Management** ✅
- Lưu địa chỉ giao hàng của user
- Endpoints:
  - `POST /user/addresses` - Thêm địa chỉ mới
  - `GET /user/addresses` - Lấy danh sách địa chỉ
  - `GET /user/addresses/:addressId` - Lấy chi tiết địa chỉ
  - `PATCH /user/addresses/:addressId` - Cập nhật địa chỉ
  - `DELETE /user/addresses/:addressId` - Xóa địa chỉ

### 3. **Location Enhancement** ✅
- Tìm cửa hàng gần nhất dựa trên vị trí người dùng
- Endpoint: `GET /locations/nearest/find?lat={latitude}&lng={longitude}&limit={number}`
- Sử dụng công thức Haversine để tính khoảng cách

### 4. **Motor Service Module** ✅
- Quản lý các dịch vụ motor (bảo trì, sửa chữa, vệ sinh, etc.)
- Attributes:
  - name, description, shortDescription
  - price, vehicleType (SCOOTER/MOTORCYCLE/ALL)
  - serviceType (MAINTENANCE/REPAIR/CLEANING/MODIFICATION/OTHER)
  - discountPercentage, imageUrl
  - estimatedDuration
- Endpoints:
  - `POST /motor-service` - Tạo dịch vụ (Admin/Employee)
  - `GET /motor-service` - Lấy tất cả dịch vụ
  - `GET /motor-service/active` - Lấy dịch vụ đang hoạt động
  - `GET /motor-service/:id` - Chi tiết dịch vụ
  - `PATCH /motor-service/:id` - Cập nhật (Admin/Employee)
  - `DELETE /motor-service/:id` - Xóa (Admin)

### 5. **Cart Module** ✅
- Giỏ hàng cho người dùng
- Endpoints:
  - `POST /cart` - Thêm sản phẩm vào giỏ hàng
  - `GET /cart` - Xem giỏ hàng
  - `GET /cart/total` - Tổng tiền và số lượng
  - `PATCH /cart/:itemId` - Cập nhật số lượng
  - `DELETE /cart/:itemId` - Xóa sản phẩm
  - `DELETE /cart` - Xóa toàn bộ giỏ hàng

### 6. **Order/Purchase Module** ✅
- Tạo đơn hàng từ giỏ hàng hoặc trực tiếp
- Order status: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- Endpoints:
  - `POST /orders` - Tạo đơn hàng
  - `POST /orders/from-cart` - Tạo đơn hàng từ giỏ hàng
  - `GET /orders` - Lấy đơn hàng của user
  - `GET /orders/all` - Lấy tất cả đơn hàng (Admin/Employee)
  - `GET /orders/:id` - Chi tiết đơn hàng
  - `PATCH /orders/:id/status` - Cập nhật trạng thái (Admin/Employee)
  - `PATCH /orders/:id/cancel` - Hủy đơn hàng (User)

### 7. **Payment Method Module** ✅
- Lưu phương thức thanh toán của user
- Types: CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, E_WALLET, COD
- Endpoints:
  - `POST /payment-methods` - Thêm phương thức thanh toán
  - `GET /payment-methods` - Lấy danh sách
  - `GET /payment-methods/:id` - Chi tiết
  - `PATCH /payment-methods/:id` - Cập nhật
  - `DELETE /payment-methods/:id` - Xóa

### 8. **QnA Module** ✅
- Hệ thống câu hỏi và trả lời giữa user và admin
- Message status: PENDING, ANSWERED, CLOSED
- Endpoints:
  - `POST /qna` - Gửi câu hỏi
  - `GET /qna/my-messages` - Lấy tin nhắn của user
  - `GET /qna/all` - Lấy tất cả tin nhắn (Admin/Employee)
  - `GET /qna/pending` - Lấy tin nhắn chờ xử lý (Admin/Employee)
  - `GET /qna/:id` - Chi tiết tin nhắn
  - `POST /qna/:id/reply` - Trả lời (Admin/Employee)
  - `PATCH /qna/:id/status/:status` - Cập nhật trạng thái (Admin/Employee)
  - `DELETE /qna/:id` - Xóa tin nhắn

## Database Entities Mới

### UserAddress
```typescript
{
  id: uuid
  userId: uuid
  name: string (e.g., "Home", "Office")
  address: string
  latitude?: number
  longitude?: number
  phone?: string
  isDefault: boolean
}
```

### MotorService
```typescript
{
  id: uuid
  name: string
  description: string
  shortDescription?: string
  price: decimal
  vehicleType: enum (SCOOTER/MOTORCYCLE/ALL)
  serviceType: enum (MAINTENANCE/REPAIR/CLEANING/MODIFICATION/OTHER)
  categoryId?: uuid
  discountPercentage: decimal (0-100)
  imageUrl?: string
  isActive: boolean
  estimatedDuration: int (minutes)
}
```

### CartItem
```typescript
{
  id: uuid
  userId: uuid
  productId: uuid
  quantity: int
}
```

### Order
```typescript
{
  id: uuid
  orderNumber: string (e.g., ORD-20231231-001)
  userId: uuid
  deliveryAddressId?: uuid
  subtotal: decimal
  shippingFee: decimal
  discount: decimal
  total: decimal
  status: enum (PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED)
  paymentMethod?: string
  notes?: string
}
```

### OrderItem
```typescript
{
  id: uuid
  orderId: uuid
  productId: uuid
  productName: string
  price: decimal
  quantity: int
  subtotal: decimal
}
```

### PaymentMethod
```typescript
{
  id: uuid
  userId: uuid
  type: enum (CREDIT_CARD/DEBIT_CARD/BANK_TRANSFER/E_WALLET/COD)
  name: string
  lastFourDigits?: string
  cardBrand?: string
  bankName?: string
  accountNumber?: string
  walletProvider?: string
  walletPhone?: string
  isDefault: boolean
}
```

### QnaMessage
```typescript
{
  id: uuid
  userId: uuid
  subject: string
  message: string
  reply?: string
  repliedBy?: uuid
  status: enum (PENDING/ANSWERED/CLOSED)
}
```

## Flow Sử Dụng

### 1. Mua hàng (Purchase Flow)
```
1. User xem products: GET /product
2. User thêm vào giỏ: POST /cart
3. User xem giỏ hàng: GET /cart
4. User chọn địa chỉ giao hàng (hoặc tạo mới): GET /user/addresses
5. User tạo đơn hàng từ giỏ: POST /orders/from-cart
   {
     "deliveryAddressId": "uuid",
     "paymentMethod": "COD",
     "notes": "Giao hàng buổi sáng"
   }
6. Giỏ hàng tự động được xóa sau khi đơn hàng thành công
7. Admin cập nhật trạng thái đơn: PATCH /orders/:id/status
```

### 2. Tìm cửa hàng gần nhất
```
1. Frontend lấy vị trí người dùng (latitude, longitude)
2. Call API: GET /locations/nearest/find?lat=10.762622&lng=106.660172&limit=5
3. Hiển thị danh sách cửa hàng gần nhất với khoảng cách (km)
```

### 3. QnA Flow
```
1. User gửi câu hỏi: POST /qna
2. Admin xem câu hỏi chờ: GET /qna/pending
3. Admin trả lời: POST /qna/:id/reply
4. User xem câu trả lời: GET /qna/my-messages
```

## Authentication

Tất cả endpoints (trừ public endpoints như GET /motor-service/active) đều yêu cầu JWT token:

```
Authorization: Bearer {token}
```

## Roles

- **CUSTOMER**: User thông thường
- **EMPLOYEE**: Nhân viên (có thể quản lý service, order, trả lời QnA)
- **ADMIN**: Quản trị viên (full quyền)

## Notes

1. **Location**: 
   - Location entity hiện tại dùng cho stores/branches
   - UserAddress entity dùng cho địa chỉ giao hàng của user

2. **Google API**: 
   - Tính năng tìm cửa hàng gần nhất đã implement bằng Haversine formula
   - Nếu muốn dùng Google Maps API, có thể tích hợp thêm sau

3. **Discount**: 
   - MotorService có field discountPercentage
   - Order có field discount để áp dụng discount tổng đơn hàng
   - Có thể mở rộng thêm promo/coupon module sau

4. **Payment**: 
   - Hiện tại chỉ lưu thông tin payment method
   - Chưa tích hợp payment gateway thực tế
   - Có thể tích hợp với VNPay, Momo, ZaloPay sau

5. **Chatbox**: 
   - QnA module hiện tại là message-based
   - Để làm real-time chat, cần thêm WebSocket (Socket.io)

## Testing với Swagger

Sau khi chạy server, truy cập:
```
http://localhost:3000/api
```

Tất cả endpoints đã được document với Swagger decorators.

## Next Steps (Optional)

1. ✅ Thêm validation cho phone number, email
2. ✅ Thêm pagination cho list endpoints
3. ✅ Thêm search/filter cho products, orders
4. ✅ Implement real-time notifications
5. ✅ Tích hợp payment gateway
6. ✅ Thêm review/rating system
7. ✅ Implement voucher/promo code system
