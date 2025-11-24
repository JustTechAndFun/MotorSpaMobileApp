import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ROLE } from '../enum/role';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
    phone: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ nullable: true })
    password: string; // hashed password (bcrypt)

    @Column({ type: 'enum', enum: ROLE, default: ROLE.CUSTOMER })
    role: ROLE;

    @Column({ type: 'text', nullable: true })
    hashedRefreshToken?: string | null;

    // Google OAuth fields
    @Index()
    @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
    email?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    googleId?: string | null;

    @Column({ type: 'text', nullable: true })
    picture?: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
