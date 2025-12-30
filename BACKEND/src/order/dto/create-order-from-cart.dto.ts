import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderFromCartDto {
    @ApiProperty({ description: 'Delivery address ID' })
    @IsNotEmpty()
    @IsString()
    deliveryAddressId: string;

    @ApiProperty({ description: 'Payment method (e.g., COD, CREDIT_CARD, BANK_TRANSFER)', required: false })
    @IsString()
    paymentMethod?: string;

    @ApiProperty({ description: 'Additional notes', required: false })
    @IsString()
    notes?: string;
}
