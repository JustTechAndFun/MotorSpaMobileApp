import { IsString, IsOptional, IsNumber, IsBoolean, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
    @ApiProperty({ example: 'Motor Spa - District 1' })
    @IsString()
    @Length(2, 200)
    name: string;

    @ApiProperty({ example: '123 Nguyen Hue, District 1, Ho Chi Minh City' })
    @IsString()
    address: string;

    @ApiPropertyOptional({ example: 10.7769 })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: 106.7009 })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ example: '+84901234567' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?\d{8,15}$/)
    phone?: string;

    @ApiPropertyOptional({ example: 'Premium motor spa services with professional staff' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
