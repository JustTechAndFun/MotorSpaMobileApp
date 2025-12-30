import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus, description: 'New order status' })
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiProperty({ description: 'Additional notes', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
