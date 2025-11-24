import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly repo: Repository<Product>,
    ) { }

    async create(dto: CreateProductDto): Promise<Product> {
        const product = this.repo.create(dto);
        return await this.repo.save(product);
    }

    async findAll(): Promise<Product[]> {
        return await this.repo.find({
            relations: ['category', 'subCategory'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAllAvailable(): Promise<Product[]> {
        return await this.repo.find({
            where: { isAvailable: true },
            relations: ['category', 'subCategory'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByCategory(categoryId: string): Promise<Product[]> {
        return await this.repo.find({
            where: { categoryId, isAvailable: true },
            relations: ['category', 'subCategory'],
            order: { createdAt: 'DESC' },
        });
    }

    async findBySubCategory(subCategoryId: string): Promise<Product[]> {
        return await this.repo.find({
            where: { subCategoryId, isAvailable: true },
            relations: ['category', 'subCategory'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.repo.findOne({
            where: { id },
            relations: ['category', 'subCategory'],
        });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async update(id: string, dto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        Object.assign(product, dto);
        return await this.repo.save(product);
    }

    async remove(id: string): Promise<{ success: boolean }> {
        const product = await this.findOne(id);
        await this.repo.remove(product);
        return { success: true };
    }
}
