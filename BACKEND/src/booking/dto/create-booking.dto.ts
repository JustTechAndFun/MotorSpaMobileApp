import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../enum/booking-status.enum';

export class CreateBookingDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    locationId: string;

    @ApiProperty({ example: '2024-12-01T10:00:00Z' })
    @IsDateString()
    bookingDate: string;

    @ApiPropertyOptional({ example: 'Please service my Honda Wave' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: BookingStatus.PENDING })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;
}
