import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    categoryId?: string;

    @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'categoryId' })
    category?: Category;

    @Column({ nullable: true })
    subCategoryId?: string;

    @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'subCategoryId' })
    subCategory?: Category;

    @Column({ type: 'text', nullable: true })
    imageUrl?: string;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
