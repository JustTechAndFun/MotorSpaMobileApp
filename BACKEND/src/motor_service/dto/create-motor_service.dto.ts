import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min, Max, IsBoolean, IsUrl } from 'class-validator';
import { VehicleType, ServiceType } from '../entities/motor_service.entity';

export class CreateMotorServiceDto {
    @ApiProperty({ description: 'Service name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Detailed description' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ description: 'Short description/summary', required: false })
    @IsOptional()
    @IsString()
    shortDescription?: string;

    @ApiProperty({ description: 'Service price' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ enum: VehicleType, description: 'Vehicle type this service applies to' })
    @IsNotEmpty()
    @IsEnum(VehicleType)
    vehicleType: VehicleType;

    @ApiProperty({ enum: ServiceType, description: 'Type of service' })
    @IsNotEmpty()
    @IsEnum(ServiceType)
    serviceType: ServiceType;

    @ApiProperty({ description: 'Category ID', required: false })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiProperty({ description: 'Discount percentage (0-100)', required: false, default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercentage?: number;

    @ApiProperty({ description: 'Service image URL', required: false })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiProperty({ description: 'Is service active', required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ description: 'Estimated duration in minutes', required: false, default: 60 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    estimatedDuration?: number;
}

