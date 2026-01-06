import { IsString, IsOptional, IsUUID, IsDateString, IsEnum, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingStatus } from '../enum/booking-status.enum';

export class BookingServiceItemDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Motor Service ID or Product ID' })
    @IsUUID()
    serviceId: string;

    @ApiProperty({ example: 1, description: 'Quantity of the service' })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ example: 'Please use synthetic oil', description: 'Special notes for this service' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateBookingDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    locationId: string;

    @ApiProperty({ example: '2024-12-01T10:00:00Z' })
    @IsDateString()
    bookingDate: string;

    @ApiProperty({
        type: [BookingServiceItemDto],
        description: 'Array of motor services selected by customer',
        example: [
            { serviceId: '550e8400-e29b-41d4-a716-446655440001', quantity: 1, notes: 'Use synthetic oil' },
            { serviceId: '550e8400-e29b-41d4-a716-446655440002', quantity: 2 }
        ]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingServiceItemDto)
    services: BookingServiceItemDto[];

    @ApiPropertyOptional({ example: 'Please service my Honda Wave' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: BookingStatus.PENDING })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;
}
