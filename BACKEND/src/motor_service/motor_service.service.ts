import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMotorServiceDto } from './dto/create-motor_service.dto';
import { UpdateMotorServiceDto } from './dto/update-motor_service.dto';
import { MotorService } from './entities/motor_service.entity';

@Injectable()
export class MotorServiceService {
  constructor(
    @InjectRepository(MotorService)
    private readonly repo: Repository<MotorService>,
  ) { }

  async create(dto: CreateMotorServiceDto): Promise<MotorService> {
    const service = this.repo.create(dto);
    return await this.repo.save(service);
  }

  async findAll(): Promise<MotorService[]> {
    return await this.repo.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive(): Promise<MotorService[]> {
    return await this.repo.find({
      where: { isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MotorService> {
    const service = await this.repo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!service) {
      throw new NotFoundException(`Motor service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: string, dto: UpdateMotorServiceDto): Promise<MotorService> {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return await this.repo.save(service);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const service = await this.findOne(id);
    await this.repo.remove(service);
    return { success: true };
  }
}
