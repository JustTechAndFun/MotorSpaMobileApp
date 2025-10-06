import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ROLE } from '../enum/role';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ length: 20 })
    phone: string;

    @Column({ length: 100 })
    name: string;

    @Column()
    password: string; // hashed password (bcrypt)

    @Column({ type: 'enum', enum: ROLE, default: ROLE.CUSTOMER })
    role: ROLE;

    @Column({ type: 'text', nullable: true })
    hashedRefreshToken?: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
