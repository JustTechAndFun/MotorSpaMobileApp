import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiCreatedResponse({ description: 'Category created successfully' })
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @ApiOkResponse({ description: 'Returns all categories' })
    findAll() {
        return this.categoryService.findAll();
    }

    @Get('active')
    @ApiOkResponse({ description: 'Returns all active categories' })
    findAllActive() {
        return this.categoryService.findAllActive();
    }

    @Get('root')
    @ApiOkResponse({ description: 'Returns all root categories (no parent)' })
    findRootCategories() {
        return this.categoryService.findRootCategories();
    }

    @Get('parent/:parentId')
    @ApiOkResponse({ description: 'Returns categories by parent id' })
    findByParent(@Param('parentId') parentId: string) {
        return this.categoryService.findCategoriesByParent(parentId);
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Returns a category by id' })
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOkResponse({ description: 'Category updated successfully' })
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOkResponse({ description: 'Category deleted successfully' })
    remove(@Param('id') id: string) {
        return this.categoryService.remove(id);
    }
}
