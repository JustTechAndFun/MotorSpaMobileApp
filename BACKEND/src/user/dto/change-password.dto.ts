import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ description: 'Current password' })
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @ApiProperty({ description: 'New password (minimum 8 characters)' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}
