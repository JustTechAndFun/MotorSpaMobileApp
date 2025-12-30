import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PaymentMethodType } from '../enum/payment-method-type.enum';

@Entity('payment_methods')
export class PaymentMethod {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'enum',
        enum: PaymentMethodType,
    })
    type: PaymentMethodType;

    @Column({ length: 100 })
    name: string; // e.g., "My Visa Card", "Vietcombank Account"

    // For card payments
    @Column({ length: 4, nullable: true })
    lastFourDigits?: string;

    @Column({ length: 50, nullable: true })
    cardBrand?: string; // e.g., "Visa", "Mastercard"

    // For bank transfer
    @Column({ length: 100, nullable: true })
    bankName?: string;

    @Column({ length: 50, nullable: true })
    accountNumber?: string;

    // For e-wallet
    @Column({ length: 100, nullable: true })
    walletProvider?: string; // e.g., "Momo", "ZaloPay"

    @Column({ length: 50, nullable: true })
    walletPhone?: string;

    @Column({ default: false })
    isDefault: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
