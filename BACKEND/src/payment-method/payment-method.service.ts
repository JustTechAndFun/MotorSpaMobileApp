import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
    constructor(
        @InjectRepository(PaymentMethod)
        private readonly repo: Repository<PaymentMethod>,
    ) { }

    async create(userId: string, dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
        // If setting as default, unset other default payment methods
        if (dto.isDefault) {
            await this.repo.update({ userId, isDefault: true }, { isDefault: false });
        }

        const paymentMethod = this.repo.create({
            userId,
            ...dto,
        });
        return await this.repo.save(paymentMethod);
    }

    async findAll(userId: string): Promise<PaymentMethod[]> {
        return await this.repo.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }

    async findOne(userId: string, id: string): Promise<PaymentMethod> {
        const paymentMethod = await this.repo.findOne({
            where: { id, userId },
        });

        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found');
        }

        return paymentMethod;
    }

    async update(userId: string, id: string, dto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
        const paymentMethod = await this.findOne(userId, id);

        // If setting as default, unset other default payment methods
        if (dto.isDefault) {
            await this.repo.update({ userId, isDefault: true }, { isDefault: false });
        }

        Object.assign(paymentMethod, dto);
        return await this.repo.save(paymentMethod);
    }

    async remove(userId: string, id: string): Promise<{ message: string }> {
        const paymentMethod = await this.findOne(userId, id);
        await this.repo.remove(paymentMethod);
        return { message: 'Payment method deleted successfully' };
    }
}
