import { IsString, IsOptional, IsBoolean, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Engine Oil' })
    @IsString()
    @Length(2, 100)
    name: string;

    @ApiPropertyOptional({ example: 'High quality engine oils for motorcycles' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsOptional()
    @IsUUID()
    parentId?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
