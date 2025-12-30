import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QnaMessage } from './entities/qna-message.entity';
import { CreateQnaMessageDto } from './dto/create-qna-message.dto';
import { ReplyQnaMessageDto } from './dto/reply-qna-message.dto';
import { MessageStatus } from './enum/message-status.enum';

@Injectable()
export class QnaService {
    constructor(
        @InjectRepository(QnaMessage)
        private readonly repo: Repository<QnaMessage>,
    ) { }

    async createMessage(userId: string, dto: CreateQnaMessageDto): Promise<QnaMessage> {
        const message = this.repo.create({
            userId,
            subject: dto.subject,
            message: dto.message,
        });
        return await this.repo.save(message);
    }

    async getUserMessages(userId: string): Promise<QnaMessage[]> {
        return await this.repo.find({
            where: { userId },
            relations: ['replier'],
            order: { createdAt: 'DESC' },
        });
    }

    async getAllMessages(): Promise<QnaMessage[]> {
        return await this.repo.find({
            relations: ['user', 'replier'],
            order: { createdAt: 'DESC' },
        });
    }

    async getPendingMessages(): Promise<QnaMessage[]> {
        return await this.repo.find({
            where: { status: MessageStatus.PENDING },
            relations: ['user'],
            order: { createdAt: 'ASC' },
        });
    }

    async getMessageById(id: string): Promise<QnaMessage> {
        const message = await this.repo.findOne({
            where: { id },
            relations: ['user', 'replier'],
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        return message;
    }

    async replyMessage(messageId: string, adminId: string, dto: ReplyQnaMessageDto): Promise<QnaMessage> {
        const message = await this.getMessageById(messageId);

        message.reply = dto.reply;
        message.repliedBy = adminId;
        message.status = dto.status || MessageStatus.ANSWERED;

        return await this.repo.save(message);
    }

    async updateMessageStatus(messageId: string, status: MessageStatus): Promise<QnaMessage> {
        const message = await this.getMessageById(messageId);
        message.status = status;
        return await this.repo.save(message);
    }

    async deleteMessage(userId: string, messageId: string): Promise<{ message: string }> {
        const message = await this.repo.findOne({ where: { id: messageId } });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        if (message.userId !== userId) {
            throw new ForbiddenException('You can only delete your own messages');
        }

        await this.repo.remove(message);
        return { message: 'Message deleted successfully' };
    }
}
