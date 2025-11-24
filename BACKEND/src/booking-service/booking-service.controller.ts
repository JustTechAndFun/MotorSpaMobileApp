import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BookingServiceService } from './booking-service.service';
import { CreateBookingServiceDto } from './dto/create-booking-service.dto';
import { UpdateBookingServiceDto } from './dto/update-booking-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';

@ApiTags('Booking Services')
@Controller('booking-services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingServiceController {
    constructor(private readonly bookingServiceService: BookingServiceService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiCreatedResponse({ description: 'Booking service created successfully' })
    create(@Body() createBookingServiceDto: CreateBookingServiceDto) {
        return this.bookingServiceService.create(createBookingServiceDto);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Returns all booking services' })
    findAll() {
        return this.bookingServiceService.findAll();
    }

    @Get('booking/:bookingId')
    @ApiOkResponse({ description: 'Returns services for a specific booking' })
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.bookingServiceService.findByBooking(bookingId);
    }

    @Get('booking/:bookingId/total')
    @ApiOkResponse({ description: 'Calculate total amount for a booking' })
    async calculateTotal(@Param('bookingId') bookingId: string) {
        const total = await this.bookingServiceService.calculateBookingTotal(bookingId);
        return { bookingId, totalAmount: total };
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Returns a booking service by id' })
    findOne(@Param('id') id: string) {
        return this.bookingServiceService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Booking service updated successfully' })
    update(@Param('id') id: string, @Body() updateBookingServiceDto: UpdateBookingServiceDto) {
        return this.bookingServiceService.update(id, updateBookingServiceDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Booking service deleted successfully' })
    remove(@Param('id') id: string) {
        return this.bookingServiceService.remove(id);
    }
}
