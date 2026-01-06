import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { BookingService as BookingServiceEntity } from '../booking-service/entities/booking-service.entity';
import { Product } from '../product/entities/product.entity';
import { MotorService } from '../motor_service/entities/motor_service.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Booking, BookingServiceEntity, Product, MotorService])],
    controllers: [BookingController],
    providers: [BookingService],
    exports: [BookingService],
})
export class BookingModule { }
