import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ROLE } from './enum/role';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
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

  private stripSensitive(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashedRefreshToken, ...rest } = user;
    return rest;
  }
}
