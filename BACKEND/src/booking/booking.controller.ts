import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiQuery, ApiOperation, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
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
    @ApiOperation({
        summary: 'Tạo booking mới với dịch vụ',
        description: 'Khách hàng tạo booking và chọn các motor services cần sử dụng. Hệ thống tự động tính tổng tiền dựa trên các dịch vụ được chọn.'
    })
    @ApiCreatedResponse({ description: 'Booking created successfully' })
    @ApiBadRequestResponse({ description: 'Services array is empty or service not available' })
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
    @ApiOperation({
        summary: 'Lấy danh sách tất cả bookings (Admin/Employee)',
        description: 'Hỗ trợ filter theo location hoặc status. Chỉ admin và employee có quyền truy cập.'
    })
    @ApiOkResponse({ description: 'Returns all bookings (admin/employee only)' })
    @ApiQuery({ name: 'locationId', required: false, type: String, description: 'Filter by location ID' })
    @ApiQuery({ name: 'status', required: false, enum: BookingStatus, description: 'Filter by booking status' })
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
    @ApiOperation({
        summary: 'Lấy danh sách bookings của khách hàng hiện tại',
        description: 'Trả về tất cả bookings mà user đã tạo, sắp xếp theo ngày đặt mới nhất.'
    })
    @ApiOkResponse({ description: 'Returns current user bookings' })
    findUserBookings(@Req() req: Request & { user?: { id: string } }) {
        const userId = req.user?.id || '';
        return this.bookingService.findUserBookings(userId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin booking theo ID',
        description: 'Trả về thông tin chi tiết của một booking bao gồm user và location.'
    })
    @ApiOkResponse({ description: 'Returns a booking by id' })
    @ApiNotFoundResponse({ description: 'Booking not found' })
    findOne(@Param('id') id: string) {
        return this.bookingService.findOne(id);
    }

    @Get(':id/with-services')
    @ApiOperation({
        summary: 'Lấy booking kèm chi tiết các dịch vụ',
        description: 'Trả về booking với danh sách đầy đủ các motor services đã chọn, bao gồm giá và số lượng.'
    })
    @ApiOkResponse({ description: 'Returns a booking with its services' })
    @ApiNotFoundResponse({ description: 'Booking not found' })
    findOneWithServices(@Param('id') id: string) {
        return this.bookingService.findOneWithServices(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Cập nhật booking',
        description: 'Khách hàng chỉ có thể update booking của mình. Admin/Employee có thể update payment details.'
    })
    @ApiOkResponse({ description: 'Booking updated successfully' })
    @ApiNotFoundResponse({ description: 'Booking not found' })
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
    @ApiOperation({
        summary: 'Xóa booking',
        description: 'Khách hàng chỉ có thể xóa booking của mình. Admin có thể xóa bất kỳ booking nào.'
    })
    @ApiOkResponse({ description: 'Booking deleted successfully' })
    @ApiNotFoundResponse({ description: 'Booking not found' })
    remove(
        @Param('id') id: string,
        @Req() req: Request & { user?: { id: string; role: ROLE } },
    ) {
        const userId = req.user?.id || '';
        const userRole = req.user?.role || ROLE.CUSTOMER;
        return this.bookingService.remove(id, userId, userRole);
    }
}
