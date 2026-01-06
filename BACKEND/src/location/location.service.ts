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

    // Find nearest stores based on user location using Haversine formula
    async findNearest(userLat: number, userLng: number, limit: number = 5): Promise<Array<Location & { distance: number }>> {
        const locations = await this.findAllActive();

        if (!locations.length) {
            return [];
        }

        // Calculate distance for each location
        const locationsWithDistance = locations
            .filter(loc => loc.latitude && loc.longitude)
            .map(location => ({
                ...location,
                distance: this.calculateDistance(
                    userLat,
                    userLng,
                    Number(location.latitude),
                    Number(location.longitude)
                )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);

        return locationsWithDistance;
    }

    // Haversine formula to calculate distance between two coordinates in kilometers
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
