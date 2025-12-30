import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MessageStatus } from '../enum/message-status.enum';

@Entity('qna_messages')
export class QnaMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ length: 200 })
    subject: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'text', nullable: true })
    reply?: string;

    @Column({ type: 'uuid', nullable: true })
    repliedBy?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'repliedBy' })
    replier?: User;

    @Column({
        type: 'enum',
        enum: MessageStatus,
        default: MessageStatus.PENDING,
    })
    status: MessageStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
