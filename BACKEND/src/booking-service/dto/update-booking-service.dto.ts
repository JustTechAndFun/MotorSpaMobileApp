import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingServiceDto } from './create-booking-service.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingServiceDto extends PartialType(CreateBookingServiceDto) {
    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;
}
