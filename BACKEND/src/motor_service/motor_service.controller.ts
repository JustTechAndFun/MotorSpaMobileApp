import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MotorServiceService } from './motor_service.service';
import { CreateMotorServiceDto } from './dto/create-motor_service.dto';
import { UpdateMotorServiceDto } from './dto/update-motor_service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';

@ApiTags('Motor Services')
@Controller('motor-service')
export class MotorServiceController {
  constructor(private readonly motorServiceService: MotorServiceService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
  @ApiCreatedResponse({ description: 'Service created successfully' })
  create(@Body() createMotorServiceDto: CreateMotorServiceDto) {
    return this.motorServiceService.create(createMotorServiceDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Returns all motor services' })
  findAll() {
    return this.motorServiceService.findAll();
  }

  @Get('active')
  @ApiOkResponse({ description: 'Returns all active motor services' })
  findAllActive() {
    return this.motorServiceService.findAllActive();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns a motor service by id' })
  findOne(@Param('id') id: string) {
    return this.motorServiceService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
  @ApiOkResponse({ description: 'Service updated successfully' })
  update(@Param('id') id: string, @Body() updateMotorServiceDto: UpdateMotorServiceDto) {
    return this.motorServiceService.update(id, updateMotorServiceDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiOkResponse({ description: 'Service deleted successfully' })
  remove(@Param('id') id: string) {
    return this.motorServiceService.remove(id);
  }
}
