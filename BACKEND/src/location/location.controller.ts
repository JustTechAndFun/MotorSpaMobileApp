import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiCreatedResponse({ description: 'Location created successfully' })
    create(@Body() createLocationDto: CreateLocationDto) {
        return this.locationService.create(createLocationDto);
    }

    @Get()
    @ApiOkResponse({ description: 'Returns all locations' })
    findAll() {
        return this.locationService.findAll();
    }

    @Get('active')
    @ApiOkResponse({ description: 'Returns all active locations' })
    findAllActive() {
        return this.locationService.findAllActive();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Returns a location by id' })
    findOne(@Param('id') id: string) {
        return this.locationService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOkResponse({ description: 'Location updated successfully' })
    update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
        return this.locationService.update(id, updateLocationDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(ROLE.ADMIN)
    @ApiOkResponse({ description: 'Location deleted successfully' })
    remove(@Param('id') id: string) {
        return this.locationService.remove(id);
    }
}
