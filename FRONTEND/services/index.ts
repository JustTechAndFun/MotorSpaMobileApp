/**
 * Service Index
 * Export tất cả các services để dễ dàng import
 */

export { addressService } from './address.service';
export { authService } from './auth.service';
export { bookingService } from './booking.service';
export { cartService } from './cart.service';
export { categoryService } from './category.service';
export { favoriteService } from './favorite.service';
export { googleAuthService } from './google-auth.service';
export { locationService } from './location.service';
export { motorServiceService } from './motor-service.service';
export { orderService } from './order.service';
export { paymentMethodService } from './payment-method.service';
export { productService } from './product.service';
export { qnaService } from './qna.service';
export { serviceService } from './service.service';
export { userService } from './user.service';

// Export default object chứa tất cả services
export default {
  address: require('./address.service').addressService,
  auth: require('./auth.service').authService,
  booking: require('./booking.service').bookingService,
  product: require('./product.service').productService,
  category: require('./category.service').categoryService,
  cart: require('./cart.service').cartService,
  user: require('./user.service').userService,
  favorite: require('./favorite.service').favoriteService,
  googleAuth: require('./google-auth.service').googleAuthService,
  location: require('./location.service').locationService,
  motorService: require('./motor-service.service').motorServiceService,
  paymentMethod: require('./payment-method.service').paymentMethodService,
  qna: require('./qna.service').qnaService,
  service: require('./service.service').serviceService,
};
