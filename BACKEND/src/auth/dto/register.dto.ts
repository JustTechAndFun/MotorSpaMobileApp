import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: '+84901234567' })
    @IsString()
    @Matches(/^\+?\d{8,15}$/)
    phone: string;

    @ApiProperty({ example: 'Nguyen Van A' })
    @IsString()
    @Length(2, 100)
    name: string;

    @ApiProperty({ example: 'Password123' })
    @IsString()
    @Length(6, 100)
    password: string;
}