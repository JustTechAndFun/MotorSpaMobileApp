import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MotorServiceService } from './motor_service.service';
import { CreateMotorServiceDto } from './dto/create-motor_service.dto';
import { UpdateMotorServiceDto } from './dto/update-motor_service.dto';

@Controller('motor-service')
export class MotorServiceController {
  constructor(private readonly motorServiceService: MotorServiceService) {}

  @Post()
  create(@Body() createMotorServiceDto: CreateMotorServiceDto) {
    return this.motorServiceService.create(createMotorServiceDto);
  }

  @Get()
  findAll() {
    return this.motorServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.motorServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMotorServiceDto: UpdateMotorServiceDto) {
    return this.motorServiceService.update(+id, updateMotorServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.motorServiceService.remove(+id);
  }
}
