import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MotorServiceModule } from './motor_service/motor_service.module';
import { UserModule } from './user/user.module';
import { LocationModule } from './location/location.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { FavoriteModule } from './favorite/favorite.module';
import { BookingModule } from './booking/booking.module';
import { BookingServiceModule } from './booking-service/booking-service.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { QnaModule } from './qna/qna.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    MotorServiceModule,
    LocationModule,
    CategoryModule,
    ProductModule,
    FavoriteModule,
    BookingModule,
    BookingServiceModule,
    CartModule,
    OrderModule,
    PaymentMethodModule,
    QnaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

