import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingServiceDto } from './dto/create-booking-service.dto';
import { UpdateBookingServiceDto } from './dto/update-booking-service.dto';
import { BookingService } from './entities/booking-service.entity';

@Injectable()
export class BookingServiceService {
    constructor(
        @InjectRepository(BookingService)
        private readonly repo: Repository<BookingService>,
    ) { }

    async create(dto: CreateBookingServiceDto): Promise<BookingService> {
        const totalPrice = dto.unitPrice * dto.quantity;
        const bookingService = this.repo.create({
            ...dto,
            totalPrice,
        });
        return await this.repo.save(bookingService);
    }

    async findAll(): Promise<BookingService[]> {
        return await this.repo.find({
            relations: ['booking', 'product', 'product.category', 'product.subCategory'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByBooking(bookingId: string): Promise<BookingService[]> {
        return await this.repo.find({
            where: { bookingId },
            relations: ['product', 'product.category', 'product.subCategory'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<BookingService> {
        const bookingService = await this.repo.findOne({
            where: { id },
            relations: ['booking', 'product', 'product.category', 'product.subCategory'],
        });
        if (!bookingService) {
            throw new NotFoundException(`Booking service with ID ${id} not found`);
        }
        return bookingService;
    }

    async update(id: string, dto: UpdateBookingServiceDto): Promise<BookingService> {
        const bookingService = await this.findOne(id);

        if (dto.quantity !== undefined || dto.unitPrice !== undefined) {
            const quantity = dto.quantity ?? bookingService.quantity;
            const unitPrice = dto.unitPrice ?? bookingService.unitPrice;
            bookingService.totalPrice = quantity * unitPrice;
        }

        Object.assign(bookingService, dto);
        return await this.repo.save(bookingService);
    }

    async remove(id: string): Promise<{ success: boolean }> {
        const bookingService = await this.findOne(id);
        await this.repo.remove(bookingService);
        return { success: true };
    }

    async calculateBookingTotal(bookingId: string): Promise<number> {
        const services = await this.findByBooking(bookingId);
        return services.reduce((total, service) => total + Number(service.totalPrice), 0);
    }
}
