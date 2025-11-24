import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
    constructor(
        @InjectRepository(Location)
        private readonly repo: Repository<Location>,
    ) { }

    async create(dto: CreateLocationDto): Promise<Location> {
        const location = this.repo.create(dto);
        return await this.repo.save(location);
    }

    async findAll(): Promise<Location[]> {
        return await this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async findAllActive(): Promise<Location[]> {
        return await this.repo.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Location> {
        const location = await this.repo.findOne({ where: { id } });
        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
        return location;
    }

    async update(id: string, dto: UpdateLocationDto): Promise<Location> {
        const location = await this.findOne(id);
        Object.assign(location, dto);
        return await this.repo.save(location);
    }

    async remove(id: string): Promise<{ success: boolean }> {
        const location = await this.findOne(id);
        await this.repo.remove(location);
        return { success: true };
    }
}
