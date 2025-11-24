import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ROLE } from '../enum/role';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 100 })
    name: string;

    @Column({ nullable: true })
    password: string; // hashed password (bcrypt)

    @Column({ type: 'enum', enum: ROLE, default: ROLE.CUSTOMER })
    role: ROLE;

    @Column({ type: 'text', nullable: true })
    hashedRefreshToken?: string | null;

    // Google OAuth fields
    @Index({ unique: true })
    @Column({ length: 255, nullable: true })
    email?: string | null;

    @Column({ length: 255, nullable: true })
    googleId?: string | null;

    @Column({ type: 'text', nullable: true })
    picture?: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
