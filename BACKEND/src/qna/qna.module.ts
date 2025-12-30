import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QnaService } from './qna.service';
import { QnaController } from './qna.controller';
import { QnaMessage } from './entities/qna-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QnaMessage])],
  controllers: [QnaController],
  providers: [QnaService],
  exports: [QnaService],
})
export class QnaModule { }
