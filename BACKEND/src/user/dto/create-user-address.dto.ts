import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserAddressDto {
    @ApiProperty({ description: 'Address name (e.g., Home, Office)' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Full address' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ description: 'Latitude', required: false })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiProperty({ description: 'Longitude', required: false })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiProperty({ description: 'Phone number', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ description: 'Set as default address', required: false, default: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
