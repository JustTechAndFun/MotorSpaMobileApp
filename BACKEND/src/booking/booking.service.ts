import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './enum/booking-status.enum';
import { ROLE } from '../user/enum/role';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly repo: Repository<Booking>,
    ) { }

    async create(userId: string, dto: CreateBookingDto): Promise<Booking> {
        const booking = this.repo.create({
            ...dto,
            userId,
            bookingDate: new Date(dto.bookingDate),
        });
        return await this.repo.save(booking);
    }

    async findAll(): Promise<Booking[]> {
        return await this.repo.find({
            relations: ['user', 'location'],
            order: { bookingDate: 'DESC' },
        });
    }

    async findUserBookings(userId: string): Promise<Booking[]> {
        return await this.repo.find({
            where: { userId },
            relations: ['location'],
            order: { bookingDate: 'DESC' },
        });
    }

    async findByLocation(locationId: string): Promise<Booking[]> {
        return await this.repo.find({
            where: { locationId },
            relations: ['user'],
            order: { bookingDate: 'DESC' },
        });
    }

    async findByStatus(status: BookingStatus): Promise<Booking[]> {
        return await this.repo.find({
            where: { status },
            relations: ['user', 'location'],
            order: { bookingDate: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Booking> {
        const booking = await this.repo.findOne({
            where: { id },
            relations: ['user', 'location'],
        });
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }
        return booking;
    }

    async update(
        id: string,
        dto: UpdateBookingDto,
        userId: string,
        userRole: ROLE,
    ): Promise<Booking> {
        const booking = await this.findOne(id);

        // Only owner or admin can update
        if (booking.userId !== userId && userRole !== ROLE.ADMIN) {
            throw new ForbiddenException('You can only update your own bookings');
        }

        // Only admin can change certain fields
        if (dto.isPaid !== undefined || dto.totalAmount !== undefined) {
            if (userRole !== ROLE.ADMIN && userRole !== ROLE.EMPLOYEE) {
                throw new ForbiddenException('Only admin/employee can update payment details');
            }
        }

        Object.assign(booking, dto);
        if (dto.bookingDate) {
            booking.bookingDate = new Date(dto.bookingDate);
        }
        return await this.repo.save(booking);
    }

    async remove(id: string, userId: string, userRole: ROLE): Promise<{ success: boolean }> {
        const booking = await this.findOne(id);

        // Only owner or admin can delete
        if (booking.userId !== userId && userRole !== ROLE.ADMIN) {
            throw new ForbiddenException('You can only delete your own bookings');
        }

        await this.repo.remove(booking);
        return { success: true };
    }
}
