import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

export enum VehicleType {
    SCOOTER = 'SCOOTER',
    MOTORCYCLE = 'MOTORCYCLE',
    ALL = 'ALL',
}

export enum ServiceType {
    MAINTENANCE = 'MAINTENANCE',
    REPAIR = 'REPAIR',
    CLEANING = 'CLEANING',
    MODIFICATION = 'MODIFICATION',
    OTHER = 'OTHER',
}

@Entity('motor_services')
export class MotorService {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    shortDescription?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'enum',
        enum: VehicleType,
        default: VehicleType.ALL,
    })
    vehicleType: VehicleType;

    @Column({
        type: 'enum',
        enum: ServiceType,
        default: ServiceType.OTHER,
    })
    serviceType: ServiceType;

    @Column({ type: 'uuid', nullable: true })
    categoryId?: string;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'categoryId' })
    category?: Category;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: 'Discount percentage (0-100)' })
    discountPercentage: number;

    @Column({ type: 'text', nullable: true })
    imageUrl?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 60, comment: 'Estimated duration in minutes' })
    estimatedDuration: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

