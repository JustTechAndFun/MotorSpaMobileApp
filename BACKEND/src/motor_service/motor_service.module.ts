import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotorServiceService } from './motor_service.service';
import { MotorServiceController } from './motor_service.controller';
import { MotorService } from './entities/motor_service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MotorService])],
  controllers: [MotorServiceController],
  providers: [MotorServiceService],
  exports: [MotorServiceService],
})
export class MotorServiceModule { }

