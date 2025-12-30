import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateQnaMessageDto {
    @ApiProperty({ description: 'Message subject' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    subject: string;

    @ApiProperty({ description: 'Message content' })
    @IsNotEmpty()
    @IsString()
    message: string;
}
