import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ example: 'Premium Engine Oil 10W-40' })
    @IsString()
    @Length(2, 200)
    name: string;

    @ApiPropertyOptional({ example: 'High performance synthetic oil for motorcycles' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 150000 })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsOptional()
    @IsUUID()
    subCategoryId?: string;

    @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @ApiPropertyOptional({ example: 50 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    stock?: number;
}
