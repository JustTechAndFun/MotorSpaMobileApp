import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../user/enum/role';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @ApiCreatedResponse({ description: 'Order created successfully' })
    createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
        const userId = req.user.id;
        return this.orderService.createOrder(userId, createOrderDto);
    }

    @Post('from-cart')
    @ApiCreatedResponse({ description: 'Order created from cart successfully' })
    createOrderFromCart(@Body() dto: CreateOrderFromCartDto, @Req() req: any) {
        const userId = req.user.id;
        return this.orderService.createOrderFromCart(userId, dto);
    }

    @Get()
    @ApiOkResponse({ description: 'Get user orders' })
    getUserOrders(@Req() req: any) {
        const userId = req.user.id;
        return this.orderService.getUserOrders(userId);
    }

    @Get('all')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Get all orders (admin/employee only)' })
    getAllOrders() {
        return this.orderService.getAllOrders();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Get order by ID' })
    getOrderById(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.orderService.getOrderById(userId, id);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(ROLE.ADMIN, ROLE.EMPLOYEE)
    @ApiOkResponse({ description: 'Update order status (admin/employee only)' })
    updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.orderService.updateOrderStatus(id, dto);
    }

    @Patch(':id/cancel')
    @ApiOkResponse({ description: 'Cancel order' })
    cancelOrder(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.orderService.cancelOrder(userId, id);
    }
}
