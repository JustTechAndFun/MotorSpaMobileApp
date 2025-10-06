import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: '+84901234567' })
    @IsString()
    @Matches(/^\+?\d{8,15}$/)
    phone: string;

    @ApiProperty({ example: 'Password123' })
    @IsString()
    password: string;
}