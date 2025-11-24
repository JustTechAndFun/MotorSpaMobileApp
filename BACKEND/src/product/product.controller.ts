import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiCreatedResponse({ description: 'Product created successfully' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productService.create(createProductDto);
    }

    @Get()
    @ApiOkResponse({ description: 'Returns all products with categories' })
    @ApiQuery({ name: 'categoryId', required: false, type: String })
    @ApiQuery({ name: 'subCategoryId', required: false, type: String })
    findAll(
        @Query('categoryId') categoryId?: string,
        @Query('subCategoryId') subCategoryId?: string,
    ) {
        if (categoryId) {
            return this.productService.findByCategory(categoryId);
        }
        if (subCategoryId) {
            return this.productService.findBySubCategory(subCategoryId);
        }
        return this.productService.findAll();
    }

    @Get('available')
    @ApiOkResponse({ description: 'Returns all available products' })
    findAllAvailable() {
        return this.productService.findAllAvailable();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Returns a product by id' })
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOkResponse({ description: 'Product updated successfully' })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOkResponse({ description: 'Product deleted successfully' })
    remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }
}
