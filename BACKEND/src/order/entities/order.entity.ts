import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { UserAddress } from '../../user/entities/user-address.entity';
import { OrderStatus } from '../enum/order-status.enum';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    orderNumber: string; // e.g., ORD-20231231-001

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid', nullable: true })
    deliveryAddressId?: string;

    @ManyToOne(() => UserAddress, { nullable: true })
    @JoinColumn({ name: 'deliveryAddressId' })
    deliveryAddress?: UserAddress;

    @OneToMany('OrderItem', 'order', { cascade: true })
    items: any[];

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippingFee: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ type: 'varchar', length: 50, nullable: true })
    paymentMethod?: string; // e.g., 'COD', 'CREDIT_CARD', 'BANK_TRANSFER'

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
