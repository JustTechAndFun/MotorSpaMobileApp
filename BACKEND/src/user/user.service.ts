import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { User } from './entities/user.entity';
import { UserAddress } from './entities/user-address.entity';
import { ROLE } from './enum/role';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(UserAddress) private readonly addressRepo: Repository<UserAddress>,
  ) { }

  async create(dto: CreateUserDto, creatorRole: ROLE) {
    // Only ADMIN can create users with role admin/employee
    let roleToSet = dto.role ?? ROLE.CUSTOMER;
    if (dto.role && [ROLE.ADMIN, ROLE.EMPLOYEE].includes(dto.role)) {
      if (creatorRole !== ROLE.ADMIN) {
        throw new ForbiddenException('Only admin can create admin or employee');
      }
      roleToSet = dto.role;
    }

    const existing = await this.repo.findOne({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Phone already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      phone: dto.phone,
      name: dto.name,
      password: passwordHash,
      role: roleToSet,
    });
    const saved = await this.repo.save(user);
    return this.stripSensitive(saved);
  }

  async findAll() {
    const users = await this.repo.find();
    return users.map((u) => this.stripSensitive(u));
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.stripSensitive(user);
  }

  async findOneRaw(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findByPhone(phone: string) {
    return this.repo.findOne({ where: { phone } });
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string) {
    return this.repo.findOne({ where: { googleId } });
  }

  async createOrUpdateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }) {
    let user = await this.findByGoogleId(googleProfile.googleId);
    if (!user && googleProfile.email) {
      user = await this.findByEmail(googleProfile.email);
    }

    const fullName = `${googleProfile.firstName || ''} ${googleProfile.lastName || ''}`.trim();

    if (user) {
      // Update existing user
      user.googleId = googleProfile.googleId;
      user.email = googleProfile.email;
      user.picture = googleProfile.picture || user.picture;
      if (!user.name || user.name.length === 0) {
        user.name = fullName;
      }
      return await this.repo.save(user);
    } else {
      // Create new user
      const newUser = this.repo.create({
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        name: fullName || 'Google User',
        picture: googleProfile.picture,
        role: ROLE.CUSTOMER,
      });
      return await this.repo.save(newUser);
    }
  }

  async update(id: string, dto: UpdateUserDto, requesterRole: ROLE) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.role) {
      if (requesterRole !== ROLE.ADMIN) {
        throw new ForbiddenException('Only admin can change role');
      }
      user.role = dto.role;
    }
    if (dto.name) user.name = dto.name;
    const saved = await this.repo.save(user);
    return this.stripSensitive(saved);
  }

  async remove(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.repo.delete(id);
    return { success: true };
  }

  async setHashedRefreshToken(userId: string, hash: string | null) {
    await this.repo.update(userId, { hashedRefreshToken: hash });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) throw new ForbiddenException('User registered with Google cannot change password');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new ForbiddenException('Current password is incorrect');

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password = newPasswordHash;
    await this.repo.save(user);
    return { message: 'Password changed successfully' };
  }

  // User Address Management
  async createUserAddress(userId: string, dto: CreateUserAddressDto) {
    // If setting as default, unset other default addresses
    if (dto.isDefault) {
      await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
    }

    const address = this.addressRepo.create({
      userId,
      ...dto,
    });
    return await this.addressRepo.save(address);
  }

  async getUserAddresses(userId: string) {
    return await this.addressRepo.find({ where: { userId } });
  }

  async getUserAddress(userId: string, addressId: string) {
    const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async updateUserAddress(userId: string, addressId: string, dto: UpdateUserAddressDto) {
    const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');

    // If setting as default, unset other default addresses
    if (dto.isDefault) {
      await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
    }

    Object.assign(address, dto);
    return await this.addressRepo.save(address);
  }

  async deleteUserAddress(userId: string, addressId: string) {
    const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.addressRepo.delete(addressId);
    return { message: 'Address deleted successfully' };
  }

  private stripSensitive(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashedRefreshToken, ...rest } = user;
    return rest;
  }
}
