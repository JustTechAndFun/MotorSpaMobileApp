import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { QnaService } from './qna.service';
import { CreateQnaMessageDto } from './dto/create-qna-message.dto';
import { ReplyQnaMessageDto } from './dto/reply-qna-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';
import { MessageStatus } from './enum/message-status.enum';

@ApiTags('QnA')
@ApiBearerAuth()
@Controller('qna')
@UseGuards(JwtAuthGuard)
export class QnaController {
    constructor(private readonly qnaService: QnaService) { }

    @Post()
    @ApiCreatedResponse({ description: 'Message sent successfully' })
    createMessage(@Body() createQnaMessageDto: CreateQnaMessageDto, @Req() req: any) {
        const userId = req.user.id;
        return this.qnaService.createMessage(userId, createQnaMessageDto);
    }

    @Get('my-messages')
    @ApiOkResponse({ description: 'Get user messages' })
    getUserMessages(@Req() req: any) {
        const userId = req.user.id;
        return this.qnaService.getUserMessages(userId);
    }

    @Get('all')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Get all messages (admin/employee only)' })
    getAllMessages() {
        return this.qnaService.getAllMessages();
    }

    @Get('pending')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Get pending messages (admin/employee only)' })
    getPendingMessages() {
        return this.qnaService.getPendingMessages();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Get message by ID' })
    getMessageById(@Param('id') id: string) {
        return this.qnaService.getMessageById(id);
    }

    @Post(':id/reply')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Reply to message (admin/employee only)' })
    replyMessage(
        @Param('id') id: string,
        @Body() replyDto: ReplyQnaMessageDto,
        @Req() req: any
    ) {
        const adminId = req.user.id;
        return this.qnaService.replyMessage(id, adminId, replyDto);
    }

    @Patch(':id/status/:status')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Update message status (admin/employee only)' })
    updateMessageStatus(
        @Param('id') id: string,
        @Param('status') status: MessageStatus
    ) {
        return this.qnaService.updateMessageStatus(id, status);
    }

    @Delete(':id')
    @ApiOkResponse({ description: 'Delete message' })
    deleteMessage(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.qnaService.deleteMessage(userId, id);
    }
}
