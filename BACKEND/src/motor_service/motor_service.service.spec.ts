import { Test, TestingModule } from '@nestjs/testing';
import { MotorServiceService } from './motor_service.service';

describe('MotorServiceService', () => {
  let service: MotorServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotorServiceService],
    }).compile();

    service = module.get<MotorServiceService>(MotorServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
