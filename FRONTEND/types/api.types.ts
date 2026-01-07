/**
 * API Response Types
 * Định nghĩa các kiểu dữ liệu response từ API
 */

// Base Response
export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data: T;
}

// Pagination Response
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Response
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Google Auth Types
export interface GoogleAuthRequest {
  idToken: string;
}

export interface GoogleAuthResponse extends AuthResponse {
  // Same as AuthResponse, but can be extended if needed
}

// User Types
export interface User {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  role: string;
  googleId: string | null;
  picture: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

// Admin User Management Types
export interface AdminCreateUserRequest {
  phone: string;
  name: string;
  password: string;
  role: 'admin' | 'customer';
  email?: string;
}

export interface AdminUpdateUserRequest {
  phone?: string;
  name?: string;
  password?: string;
  role?: string;
  email?: string;
  picture?: string;
}

export interface AdminUserListResponse {
  users: User[];
  total: number;
}

// Category Types
export type CategoryType = 'product' | 'service';

export interface Category {
  id: string | number;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  imageUrl?: string;
  parentId?: string | null;
  type?: CategoryType; // 'product' or 'service' to distinguish category type
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

// Cart Types
export interface CartItem {
  id: string | number;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface AddToCartRequest {
  productId: string | number;
  quantity: number;
}

// Order Types
export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  deliveryAddressId: string;
  paymentMethod: string;
  notes?: string;
  status: 'pending' | 'processing' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  deliveryAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  deliveryAddressId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
}

// Location/Address Types
export interface Address {
  id: string | number;
  name: string;
  phone: string;
  fullName?: string; // Alias for name
  phoneNumber?: string; // Alias for phone
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

export interface AddAddressRequest {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isDefault?: boolean;
}

export interface AddLocationRequest {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
}

// Motor Service Types
export type VehicleType = 'SCOOTER' | 'SPORT' | 'CRUISER' | 'TOURING' | 'ELECTRIC';
export type ServiceType = 'MAINTENANCE' | 'REPAIR' | 'INSPECTION' | 'CLEANING' | 'UPGRADE';

// Service Types (simpler version, similar to Product structure)
export interface Service {
  id: string | number;
  name: string;
  description: string;
  price: number | string; // Can be string from API
  duration?: number; // in minutes
  categoryId: string | number;
  subCategoryId?: string | number;
  imageUrl: string | null;
  isActive?: boolean;
  isAvailable?: boolean;
  stock?: number; // Services have stock = 0
  type?: 'service'; // To distinguish from products
  category?: Category;
  subCategory?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface MotorService {
  id?: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  vehicleType: VehicleType;
  serviceType: ServiceType;
  categoryId: string;
  discountPercentage: number;
  imageUrl: string;
  isActive: boolean;
  estimatedDuration: number; // in minutes
}

export interface CreateMotorServiceRequest {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  vehicleType: VehicleType;
  serviceType: ServiceType;
  categoryId: string;
  discountPercentage: number;
  imageUrl: string;
  isActive: boolean;
  estimatedDuration: number;
}

export interface UpdateMotorServiceRequest {
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  vehicleType?: VehicleType;
  serviceType?: ServiceType;
  categoryId?: string;
  discountPercentage?: number;
  imageUrl?: string;
  isActive?: boolean;
  estimatedDuration?: number;
}

// Old Payment Types - deprecated, use PaymentMethodType instead

// Notification Types
export interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'promotion' | 'system';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

// Store Location Types (Shop addresses)
export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreLocationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateStoreLocationRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  description?: string;
  isActive?: boolean;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingLocation {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingService {
  serviceId: string;
  quantity: number;
  notes?: string;
}

export interface BookingServiceDetail extends BookingService {
  service: MotorService;
  price: number;
  totalPrice: number;
}

export interface CreateBookingRequest {
  locationId: string;
  bookingDate: string; // ISO string (includes date and time)
  services: BookingService[];
  notes?: string;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  isPaid?: boolean;
  totalAmount?: number;
  bookingDate?: string;
  locationId?: string;
  notes?: string;
}

export interface Booking {
  id: string | number;
  userId: string;
  locationId: string;
  bookingDate: string;
  totalAmount: number;
  isPaid: boolean;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  location?: BookingLocation;
}

export interface BookingWithServices extends Booking {
  services: BookingServiceDetail[];
}

export interface BookingListParams {
  locationId?: string;
  status?: BookingStatus;
}

// Search Types
export interface SearchParams {
  keyword?: string;
  categoryId?: string | number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Product Types
export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  categoryId: string | number;
  subCategoryId?: string | number;
  imageUrl: string;
  isAvailable: boolean;
  stock: number;
  type?: 'product'; // To distinguish from services
  category?: Category; // Populated category
  subCategory?: Category; // Populated subcategory
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string | number;
  subCategoryId?: string | number;
  imageUrl: string;
  isAvailable?: boolean;
  stock: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string | number;
  subCategoryId?: string | number;
  imageUrl?: string;
  isAvailable?: boolean;
  stock?: number;
}

export interface ProductListParams {
  categoryId?: string | number;
  subCategoryId?: string | number;
  search?: string;
  available?: boolean;
  page?: number;
  limit?: number;
}

// Favorite Types
export interface Favorite {
  id: string | number;
  userId: string | number;
  productId: string | number;
  product?: Product;
  createdAt?: string;
}

export interface FavoriteCheckResponse {
  isFavorite: boolean;
}

// Payment Method Types
export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET' | 'COD';

export interface PaymentMethod {
  id: string | number;
  userId: string | number;
  type: PaymentMethodType;
  name: string;
  lastFourDigits?: string;
  cardBrand?: string;
  bankName?: string;
  accountNumber?: string;
  walletProvider?: string;
  walletPhone?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentMethodRequest {
  type: PaymentMethodType;
  name: string;
  lastFourDigits?: string;
  cardBrand?: string;
  bankName?: string;
  accountNumber?: string;
  walletProvider?: string;
  walletPhone?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodRequest {
  type?: PaymentMethodType;
  name?: string;
  lastFourDigits?: string;
  cardBrand?: string;
  bankName?: string;
  accountNumber?: string;
  walletProvider?: string;
  walletPhone?: string;
  isDefault?: boolean;
}

// QnA Types
export type QnAStatus = 'PENDING' | 'ANSWERED' | 'CLOSED';

export interface QnAMessage {
  id: string;
  userId: string;
  subject: string;
  message: string;
  reply?: string;
  status: QnAStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateQnARequest {
  subject: string;
  message: string;
}

export interface ReplyQnARequest {
  reply: string;
  status?: QnAStatus;
}
