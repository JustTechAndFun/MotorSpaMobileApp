import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, Length } from 'class-validator';
import { PaymentMethodType } from '../enum/payment-method-type.enum';

export class CreatePaymentMethodDto {
    @ApiProperty({ enum: PaymentMethodType, description: 'Payment method type' })
    @IsNotEmpty()
    @IsEnum(PaymentMethodType)
    type: PaymentMethodType;

    @ApiProperty({ description: 'Payment method name (e.g., "My Visa Card")' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Last 4 digits of card', required: false })
    @IsOptional()
    @IsString()
    @Length(4, 4)
    lastFourDigits?: string;

    @ApiProperty({ description: 'Card brand (e.g., Visa, Mastercard)', required: false })
    @IsOptional()
    @IsString()
    cardBrand?: string;

    @ApiProperty({ description: 'Bank name', required: false })
    @IsOptional()
    @IsString()
    bankName?: string;

    @ApiProperty({ description: 'Bank account number', required: false })
    @IsOptional()
    @IsString()
    accountNumber?: string;

    @ApiProperty({ description: 'E-wallet provider (e.g., Momo, ZaloPay)', required: false })
    @IsOptional()
    @IsString()
    walletProvider?: string;

    @ApiProperty({ description: 'E-wallet phone number', required: false })
    @IsOptional()
    @IsString()
    walletPhone?: string;

    @ApiProperty({ description: 'Set as default payment method', required: false, default: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
