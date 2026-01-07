/**
 * API Configuration
 * Cấu hình cho các endpoints và base URL của API
 */

// Cấu hình môi trường
export const API_CONFIG = {
  // Base URL cho API
  BASE_URL: __DEV__ 
    ? 'https://p01--mobileapp--5w2bhtv7gtwb.code.run' // Development - sử dụng API thực
    : 'https://p01--mobileapp--5w2bhtv7gtwb.code.run', // Production
  
  TIMEOUT: 30000, // 30 seconds
  
  // Headers mặc định
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    // Google OAuth endpoints
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    GOOGLE_MOBILE: '/auth/google/mobile',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: (userId: string) => `/user/${userId}`,
    CHANGE_PASSWORD: '/user/change-password',
    UPLOAD_AVATAR: '/user/avatar',
    ADDRESSES: '/user/addresses',
    ADDRESS_DETAIL: (addressId: string) => `/user/addresses/${addressId}`,
  },
  
  // Admin endpoints
  ADMIN: {
    GET_ALL_USERS: '/user',
    CREATE_USER: '/user',
    UPDATE_USER: '/user',
    DELETE_USER: (userId: string) => `/user/${userId}`,
  },
  
  // Product endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string | number) => `/products/${id}`,
    SEARCH: '/products/search',
    BY_CATEGORY: (categoryId: string | number) => `/products/category/${categoryId}`,
    FEATURED: '/products/featured',
  },
  
  // Category endpoints
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string | number) => `/categories/${id}`,
  },
  
  // Cart endpoints
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (itemId: string | number) => `/cart/update/${itemId}`,
    REMOVE: (itemId: string | number) => `/cart/remove/${itemId}`,
    CLEAR: '/cart/clear',
  },
  
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: string | number) => `/orders/${id}`,
    CANCEL: (id: string | number) => `/orders/${id}/cancel`,
  },
  
  // Booking endpoints
  BOOKING: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAIL: (id: string | number) => `/bookings/${id}`,
    CANCEL: (id: string | number) => `/bookings/${id}/cancel`,
  },
  
  // Favorite endpoints
  FAVORITES: {
    LIST: '/favorites',
    ADD: '/favorites',
    REMOVE: (id: string | number) => `/favorites/${id}`,
  },
  
  // Location endpoints
  LOCATIONS: {
    LIST: '/locations',
    ADD: '/locations',
    UPDATE: (id: string | number) => `/locations/${id}`,
    DELETE: (id: string | number) => `/locations/${id}`,
    SET_DEFAULT: (id: string | number) => `/locations/${id}/set-default`,
  },
  
  // Payment endpoints
  PAYMENT: {
    METHODS: '/payment/methods',
    ADD_METHOD: '/payment/methods',
    REMOVE_METHOD: (id: string | number) => `/payment/methods/${id}`,
    PROCESS: '/payment/process',
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (id: string | number) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    DELETE: (id: string | number) => `/notifications/${id}`,
  },
};
