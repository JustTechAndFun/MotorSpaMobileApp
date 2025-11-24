import { IsUUID, IsNumber, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookingServiceDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    bookingId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    productId: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 150000 })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional({ example: 'Extra notes for this service' })
    @IsOptional()
    @IsString()
    notes?: string;
}
