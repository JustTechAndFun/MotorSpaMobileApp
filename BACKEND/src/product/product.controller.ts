import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiQuery, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
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
    @ApiOperation({ 
        summary: 'Tạo product mới (Admin only)',
        description: 'Tạo sản phẩm/dịch vụ mới. Chỉ admin có quyền tạo.'
    })
    @ApiCreatedResponse({ description: 'Product created successfully' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Lấy danh sách products',
        description: 'Trả về tất cả products. Hỗ trợ filter theo category hoặc subcategory.'
    })
    @ApiOkResponse({ description: 'Returns all products with categories' })
    @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category' })
    @ApiQuery({ name: 'subCategoryId', required: false, type: String, description: 'Filter by subcategory' })
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
    @ApiOperation({ 
        summary: 'Lấy products còn hàng',
        description: 'Trả về chỉ các products còn available (isAvailable = true).'
    })
    @ApiOkResponse({ description: 'Returns all available products' })
    findAllAvailable() {
        return this.productService.findAllAvailable();
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Lấy thông tin product theo ID',
        description: 'Trả về chi tiết product bao gồm category, giá, stock, v.v.'
    })
    @ApiOkResponse({ description: 'Returns a product by id' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOperation({ 
        summary: 'Cập nhật product (Admin only)',
        description: 'Cập nhật thông tin product như giá, stock, availability.'
    })
    @ApiOkResponse({ description: 'Product updated successfully' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOperation({ 
        summary: 'Xóa product (Admin only)',
        description: 'Xóa product khỏi hệ thống.'
    })
    @ApiOkResponse({ description: 'Product deleted successfully' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }
}
