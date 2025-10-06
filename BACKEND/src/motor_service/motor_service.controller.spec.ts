import { Test, TestingModule } from '@nestjs/testing';
import { MotorServiceController } from './motor_service.controller';
import { MotorServiceService } from './motor_service.service';

describe('MotorServiceController', () => {
  let controller: MotorServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotorServiceController],
      providers: [MotorServiceService],
    }).compile();

    controller = module.get<MotorServiceController>(MotorServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
