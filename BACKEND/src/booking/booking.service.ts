import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './enum/booking-status.enum';
import { ROLE } from '../user/enum/role';
import { BookingService as BookingServiceEntity } from '../booking-service/entities/booking-service.entity';
import { Product } from '../product/entities/product.entity';
import { MotorService } from '../motor_service/entities/motor_service.entity';

@Injectable()
export class BookingService {
    constructor(
        @InjectRepository(Booking)
        private readonly repo: Repository<Booking>,
        @InjectRepository(BookingServiceEntity)
        private readonly bookingServiceRepo: Repository<BookingServiceEntity>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(MotorService)
        private readonly motorServiceRepo: Repository<MotorService>,
        private readonly dataSource: DataSource,
    ) { }

    async create(userId: string, dto: CreateBookingDto): Promise<Booking> {
        // Validate services array
        if (!dto.services || dto.services.length === 0) {
            throw new BadRequestException('At least one service must be selected');
        }

        // Use transaction to ensure data consistency
        return await this.dataSource.transaction(async (manager) => {
            // Create booking first
            const booking = manager.create(Booking, {
                userId,
                locationId: dto.locationId,
                bookingDate: new Date(dto.bookingDate),
                notes: dto.notes,
                status: dto.status || BookingStatus.PENDING,
                totalAmount: 0,
                isPaid: false,
            });
            const savedBooking = await manager.save(Booking, booking);

            // Process each service
            let totalAmount = 0;
            for (const serviceItem of dto.services) {
                // Try to find in MotorService first, then in Product
                let service = await this.motorServiceRepo.findOne({
                    where: { id: serviceItem.serviceId },
                });

                let product: Product | null = null;
                let unitPrice = 0;

                if (service) {
                    // Found in MotorService
                    if (!service.isActive) {
                        throw new BadRequestException(`Service ${service.name} is not available`);
                    }
                    unitPrice = Number(service.price);

                    // Try to find corresponding product
                    product = await this.productRepo.findOne({
                        where: { name: service.name },
                    });
                } else {
                    // Try to find in Product
                    product = await this.productRepo.findOne({
                        where: { id: serviceItem.serviceId },
                    });

                    if (!product) {
                        throw new NotFoundException(`Service with ID ${serviceItem.serviceId} not found`);
                    }

                    if (!product.isAvailable) {
                        throw new BadRequestException(`Service ${product.name} is not available`);
                    }
                    unitPrice = Number(product.price);
                }

                // If we don't have a product yet, create one from MotorService
                if (!product && service) {
                    product = await manager.save(Product, {
                        name: service.name,
                        description: service.description,
                        price: service.price,
                        categoryId: service.categoryId,
                        isAvailable: service.isActive,
                    });
                }

                // Create booking service entry
                const itemTotal = unitPrice * serviceItem.quantity;
                const bookingService = manager.create(BookingServiceEntity, {
                    bookingId: savedBooking.id,
                    productId: product!.id,
                    quantity: serviceItem.quantity,
                    unitPrice: unitPrice,
                    totalPrice: itemTotal,
                    notes: serviceItem.notes,
                    isPaid: false,
                });
                await manager.save(BookingServiceEntity, bookingService);

                totalAmount += itemTotal;
            }

            // Update booking with total amount
            savedBooking.totalAmount = totalAmount;
            await manager.save(Booking, savedBooking);

            // Return booking with relations
            return await manager.findOne(Booking, {
                where: { id: savedBooking.id },
                relations: ['user', 'location'],
            }) as Booking;
        });
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

    async findOneWithServices(id: string): Promise<Booking & { bookingServices?: BookingServiceEntity[] }> {
        const booking = await this.findOne(id);
        const bookingServices = await this.bookingServiceRepo.find({
            where: { bookingId: id },
            relations: ['product', 'product.category', 'product.subCategory'],
        });
        return { ...booking, bookingServices };
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
