import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiForbiddenResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
  @ApiCreatedResponse({ description: 'User created' })
  @ApiForbiddenResponse({ description: 'Only admin can create admin/employee' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  create(@Body() createUserDto: CreateUserDto, @Req() req: unknown) {
    const role = this.extractRole(req);
    return this.userService.create(createUserDto, role);
  }

  @Get()
  @ApiOkResponse({ description: 'List users' })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get user by id' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update user' })
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: unknown) {
    const role = this.extractRole(req);
    return this.userService.update(id, updateUserDto, role);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete user' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
