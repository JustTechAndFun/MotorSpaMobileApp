import { Injectable } from '@nestjs/common';
import { CreateMotorServiceDto } from './dto/create-motor_service.dto';
import { UpdateMotorServiceDto } from './dto/update-motor_service.dto';

@Injectable()
export class MotorServiceService {
  create(createMotorServiceDto: CreateMotorServiceDto) {
    return 'This action adds a new motorService';
  }

  findAll() {
    return `This action returns all motorService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} motorService`;
  }

  update(id: number, updateMotorServiceDto: UpdateMotorServiceDto) {
    return `This action updates a #${id} motorService`;
  }

  remove(id: number) {
    return `This action removes a #${id} motorService`;
  }
}
