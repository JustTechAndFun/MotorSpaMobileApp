import { Module } from '@nestjs/common';
import { MotorServiceService } from './motor_service.service';
import { MotorServiceController } from './motor_service.controller';

@Module({
  controllers: [MotorServiceController],
  providers: [MotorServiceService],
})
export class MotorServiceModule {}
