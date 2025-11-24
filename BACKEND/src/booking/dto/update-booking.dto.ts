import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../enum/booking-status.enum';
import { Type } from 'class-transformer';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
    @ApiPropertyOptional({ example: BookingStatus.CONFIRMED })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;

    @ApiPropertyOptional({ example: 250000 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    totalAmount?: number;
}
