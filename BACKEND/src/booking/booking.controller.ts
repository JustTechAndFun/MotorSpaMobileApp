import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';
import { BookingStatus } from './enum/booking-status.enum';
import { Request } from 'express';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    @Post()
    @ApiCreatedResponse({ description: 'Booking created successfully' })
    create(
        @Body() createBookingDto: CreateBookingDto,
        @Req() req: Request & { user?: { id: string } },
    ) {
        const userId = req.user?.id || '';
        return this.bookingService.create(userId, createBookingDto);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Returns all bookings (admin/employee only)' })
    @ApiQuery({ name: 'locationId', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
    findAll(
        @Query('locationId') locationId?: string,
        @Query('status') status?: BookingStatus,
    ) {
        if (locationId) {
            return this.bookingService.findByLocation(locationId);
        }
        if (status) {
            return this.bookingService.findByStatus(status);
        }
        return this.bookingService.findAll();
    }

    @Get('my-bookings')
    @ApiOkResponse({ description: 'Returns current user bookings' })
    findUserBookings(@Req() req: Request & { user?: { id: string } }) {
        const userId = req.user?.id || '';
        return this.bookingService.findUserBookings(userId);
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Returns a booking by id' })
    findOne(@Param('id') id: string) {
        return this.bookingService.findOne(id);
    }

    @Patch(':id')
    @ApiOkResponse({ description: 'Booking updated successfully' })
    update(
        @Param('id') id: string,
        @Body() updateBookingDto: UpdateBookingDto,
        @Req() req: Request & { user?: { id: string; role: ROLE } },
    ) {
        const userId = req.user?.id || '';
        const userRole = req.user?.role || ROLE.CUSTOMER;
        return this.bookingService.update(id, updateBookingDto, userId, userRole);
    }

    @Delete(':id')
    @ApiOkResponse({ description: 'Booking deleted successfully' })
    remove(
        @Param('id') id: string,
        @Req() req: Request & { user?: { id: string; role: ROLE } },
    ) {
        const userId = req.user?.id || '';
        const userRole = req.user?.role || ROLE.CUSTOMER;
        return this.bookingService.remove(id, userId, userRole);
    }
}
