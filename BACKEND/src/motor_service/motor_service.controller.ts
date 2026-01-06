import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
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
  @ApiOperation({ 
    summary: 'Tạo motor service mới (Admin/Employee)',
    description: 'Tạo dịch vụ xe máy mới như thay dầu, vệ sinh, sửa chữa, v.v. Chỉ admin và employee có quyền.'
  })
  @ApiCreatedResponse({ description: 'Service created successfully' })
  create(@Body() createMotorServiceDto: CreateMotorServiceDto) {
    return this.motorServiceService.create(createMotorServiceDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Lấy danh sách tất cả motor services',
    description: 'Trả về tất cả dịch vụ xe máy (bao gồm cả inactive). Public endpoint.'
  })
  @ApiOkResponse({ description: 'Returns all motor services' })
  findAll() {
    return this.motorServiceService.findAll();
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Lấy danh sách motor services đang hoạt động',
    description: 'Trả về chỉ các dịch vụ còn active. Dùng để hiển thị cho khách hàng khi đặt lịch.'
  })
  @ApiOkResponse({ description: 'Returns all active motor services' })
  findAllActive() {
    return this.motorServiceService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Lấy thông tin motor service theo ID',
    description: 'Trả về chi tiết của một dịch vụ bao gồm giá, mô tả, loại xe, thời gian ước tính.'
  })
  @ApiOkResponse({ description: 'Returns a motor service by id' })
  @ApiNotFoundResponse({ description: 'Motor service not found' })
  findOne(@Param('id') id: string) {
    return this.motorServiceService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
  @ApiOperation({ 
    summary: 'Cập nhật motor service (Admin/Employee)',
    description: 'Cập nhật thông tin dịch vụ như giá, mô tả, trạng thái active.'
  })
  @ApiOkResponse({ description: 'Service updated successfully' })
  @ApiNotFoundResponse({ description: 'Motor service not found' })
  update(@Param('id') id: string, @Body() updateMotorServiceDto: UpdateMotorServiceDto) {
    return this.motorServiceService.update(id, updateMotorServiceDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiOperation({ 
    summary: 'Xóa motor service (Admin only)',
    description: 'Xóa dịch vụ khỏi hệ thống. Chỉ admin có quyền.'
  })
  @ApiOkResponse({ description: 'Service deleted successfully' })
  @ApiNotFoundResponse({ description: 'Motor service not found' })
  remove(@Param('id') id: string) {
    return this.motorServiceService.remove(id);
  }
}
