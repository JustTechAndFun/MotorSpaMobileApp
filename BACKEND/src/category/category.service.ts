import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly repo: Repository<Category>,
    ) { }

    async create(dto: CreateCategoryDto): Promise<Category> {
        if (dto.parentId) {
            const parent = await this.findOne(dto.parentId);
            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }
        }
        const category = this.repo.create(dto);
        return await this.repo.save(category);
    }

    async findAll(): Promise<Category[]> {
        return await this.repo.find({
            relations: ['parent', 'children'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAllActive(): Promise<Category[]> {
        return await this.repo.find({
            where: { isActive: true },
            relations: ['parent', 'children'],
            order: { createdAt: 'DESC' },
        });
    }

    async findRootCategories(): Promise<Category[]> {
        return await this.repo.find({
            where: { parentId: IsNull(), isActive: true },
            relations: ['children'],
            order: { createdAt: 'DESC' },
        });
    }

    async findCategoriesByParent(parentId: string): Promise<Category[]> {
        return await this.repo.find({
            where: { parentId, isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Category> {
        const category = await this.repo.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }

    async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);
        
        if (dto.parentId) {
            if (dto.parentId === id) {
                throw new BadRequestException('Category cannot be its own parent');
            }
            const parent = await this.findOne(dto.parentId);
            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }
        }

        Object.assign(category, dto);
        return await this.repo.save(category);
    }

    async remove(id: string): Promise<{ success: boolean }> {
        const category = await this.findOne(id);
        await this.repo.remove(category);
        return { success: true };
    }
}
