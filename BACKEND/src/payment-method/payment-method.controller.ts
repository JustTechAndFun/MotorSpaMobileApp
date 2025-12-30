import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodController {
    constructor(private readonly paymentMethodService: PaymentMethodService) { }

    @Post()
    @ApiCreatedResponse({ description: 'Payment method created successfully' })
    create(@Body() createPaymentMethodDto: CreatePaymentMethodDto, @Req() req: any) {
        const userId = req.user.id;
        return this.paymentMethodService.create(userId, createPaymentMethodDto);
    }

    @Get()
    @ApiOkResponse({ description: 'Get all payment methods' })
    findAll(@Req() req: any) {
        const userId = req.user.id;
        return this.paymentMethodService.findAll(userId);
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Get payment method by ID' })
    findOne(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.paymentMethodService.findOne(userId, id);
    }

    @Patch(':id')
    @ApiOkResponse({ description: 'Update payment method' })
    update(
        @Param('id') id: string,
        @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
        @Req() req: any
    ) {
        const userId = req.user.id;
        return this.paymentMethodService.update(userId, id, updatePaymentMethodDto);
    }

    @Delete(':id')
    @ApiOkResponse({ description: 'Delete payment method' })
    remove(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.paymentMethodService.remove(userId, id);
    }
}
