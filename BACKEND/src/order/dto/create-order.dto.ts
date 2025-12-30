import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, Min } from 'class-validator';

class OrderItemDto {
    @ApiProperty({ description: 'Product ID' })
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({ description: 'Quantity' })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Delivery address ID' })
    @IsNotEmpty()
    @IsString()
    deliveryAddressId: string;

    @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
    @IsNotEmpty()
    @IsArray()
    items: OrderItemDto[];

    @ApiProperty({ description: 'Payment method (e.g., COD, CREDIT_CARD, BANK_TRANSFER)', required: false })
    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @ApiProperty({ description: 'Additional notes', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
