import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleSignInDto {
    @ApiProperty({
        description: 'Google ID Token from mobile app',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...'
    })
    @IsString()
    @IsNotEmpty()
    idToken: string;
}
