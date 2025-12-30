import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageStatus } from '../enum/message-status.enum';

export class ReplyQnaMessageDto {
    @ApiProperty({ description: 'Reply message' })
    @IsNotEmpty()
    @IsString()
    reply: string;

    @ApiProperty({ enum: MessageStatus, description: 'Message status', required: false })
    @IsOptional()
    @IsEnum(MessageStatus)
    status?: MessageStatus;
}
