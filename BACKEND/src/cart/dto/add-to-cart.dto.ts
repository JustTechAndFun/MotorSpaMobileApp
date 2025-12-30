import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({ description: 'Product ID' })
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({ description: 'Quantity', default: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}
