import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiForbiddenResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { ROLE } from './enum/role';

// Guards (will be implemented in auth section)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // local interface to help with typing request user
  private extractRole(req: unknown): ROLE {
    try {
      const r = req as { user?: { role?: ROLE } };
      return r?.user?.role ?? ROLE.CUSTOMER;
    } catch {
      return ROLE.CUSTOMER;
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo user mới (Admin only)',
    description: 'Chỉ admin có thể tạo user. Admin có thể tạo admin/employee, còn role khác chỉ tạo được customer.'
  })
  @ApiCreatedResponse({ description: 'User created' })
  @ApiForbiddenResponse({ description: 'Only admin can create admin/employee' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  create(@Body() createUserDto: CreateUserDto, @Req() req: unknown) {
    const role = this.extractRole(req);
    return this.userService.create(createUserDto, role);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả users',
    description: 'Trả về danh sách tất cả users trong hệ thống.'
  })
  @ApiOkResponse({ description: 'List users' })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  // ========================================
  // SPECIFIC ROUTES (must be BEFORE :id routes)
  // ========================================

  @Post('change-password')
  @ApiOperation({
    summary: 'Đổi mật khẩu',
    description: 'User đổi mật khẩu của chính mình. Yêu cầu nhập mật khẩu cũ để xác thực. Không áp dụng cho tài khoản Google.'
  })
  @ApiOkResponse({ description: 'Change password' })
  @ApiForbiddenResponse({ description: 'Current password is incorrect or user registered with Google' })
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: any) {
    const userId = req.user.id;
    return this.userService.changePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  // User Address endpoints
  @Post('addresses')
  @ApiOperation({
    summary: 'Thêm địa chỉ mới',
    description: 'Khách hàng thêm địa chỉ giao hàng/địa chỉ liên hệ mới vào tài khoản.'
  })
  @ApiCreatedResponse({ description: 'Address created' })
  @UseGuards(JwtAuthGuard)
  createAddress(@Body() createAddressDto: CreateUserAddressDto, @Req() req: any) {
    const userId = req.user.id;
    return this.userService.createUserAddress(userId, createAddressDto);
  }

  @Get('addresses')
  @ApiOperation({
    summary: 'Lấy danh sách địa chỉ của user',
    description: 'Trả về tất cả địa chỉ đã lưu của khách hàng hiện tại.'
  })
  @ApiOkResponse({ description: 'Get user addresses' })
  @UseGuards(JwtAuthGuard)
  getUserAddresses(@Req() req: any) {
    const userId = req.user.id;
    return this.userService.getUserAddresses(userId);
  }

  @Get('addresses/:addressId')
  @ApiOperation({
    summary: 'Lấy thông tin một địa chỉ cụ thể',
    description: 'Trả về chi tiết của một địa chỉ theo ID.'
  })
  @ApiOkResponse({ description: 'Get specific address' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @UseGuards(JwtAuthGuard)
  getUserAddress(@Param('addressId') addressId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.userService.getUserAddress(userId, addressId);
  }

  @Patch('addresses/:addressId')
  @ApiOperation({
    summary: 'Cập nhật địa chỉ',
    description: 'Khách hàng cập nhật thông tin địa chỉ của mình.'
  })
  @ApiOkResponse({ description: 'Update address' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @UseGuards(JwtAuthGuard)
  updateAddress(
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateUserAddressDto,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.userService.updateUserAddress(userId, addressId, updateAddressDto);
  }

  @Delete('addresses/:addressId')
  @ApiOperation({
    summary: 'Xóa địa chỉ',
    description: 'Khách hàng xóa địa chỉ khỏi danh sách của mình.'
  })
  @ApiOkResponse({ description: 'Delete address' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @UseGuards(JwtAuthGuard)
  deleteAddress(@Param('addressId') addressId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.userService.deleteUserAddress(userId, addressId);
  }

  // ========================================
  // DYNAMIC ROUTES (must be AFTER specific routes)
  // ========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin user theo ID',
    description: 'Trả về thông tin chi tiết của một user.'
  })
  @ApiOkResponse({ description: 'Get user by id' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin user',
    description: 'User có thể update thông tin của chính mình. Admin có thể update bất kỳ user nào.'
  })
  @ApiOkResponse({ description: 'Update user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: unknown) {
    const role = this.extractRole(req);
    return this.userService.update(id, updateUserDto, role);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa user',
    description: 'Xóa user khỏi hệ thống. Thường dành cho admin.'
  })
  @ApiOkResponse({ description: 'Delete user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
