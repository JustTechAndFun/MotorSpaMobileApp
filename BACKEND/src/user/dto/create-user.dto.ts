import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ROLE } from '../enum/role';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: '+84901234567' })
    @IsString()
    @Matches(/^\+?\d{8,15}$/, { message: 'phone must be a valid phone number' })
    phone: string;

    @ApiProperty({ example: 'Nguyen Van A', minLength: 2, maxLength: 100 })
    @IsString()
    @Length(2, 100)
    name: string;

    @ApiProperty({ example: 'Password123', minLength: 6 })
    @IsString()
    @Length(6, 100)
    password: string;

    @ApiPropertyOptional({ enum: ROLE, description: 'Only ADMIN can set admin/employee; default customer' })
    @IsOptional()
    @IsEnum(ROLE)
    role?: ROLE; // only ADMIN can set (admin or employee)
}
