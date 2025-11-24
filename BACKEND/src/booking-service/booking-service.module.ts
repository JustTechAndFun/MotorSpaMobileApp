import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingServiceService } from './booking-service.service';
import { BookingServiceController } from './booking-service.controller';
import { BookingService } from './entities/booking-service.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BookingService])],
    controllers: [BookingServiceController],
    providers: [BookingServiceService],
    exports: [BookingServiceService],
})
export class BookingServiceModule { }
