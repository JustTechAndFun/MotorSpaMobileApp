import { PartialType } from '@nestjs/mapped-types';
import { CreateMotorServiceDto } from './create-motor_service.dto';

export class UpdateMotorServiceDto extends PartialType(CreateMotorServiceDto) {}
