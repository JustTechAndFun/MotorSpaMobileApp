import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post('register')
    @ApiCreatedResponse({ description: 'User registered and tokens issued' })
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Post('login')
    @ApiOkResponse({ description: 'User authenticated, returns tokens' })
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    @Post('refresh')
    @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
    @ApiOkResponse({ description: 'New access & refresh tokens' })
    refresh(@Body('refreshToken') refreshToken: string) {
        return this.auth.refreshTokens(refreshToken);
    }

    @Post('logout')
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'User logged out (refresh token invalidated)' })
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: Request & { user?: { id: string } }) {
        const id = req?.user?.id;
        return this.auth.logout(id || '');
    }
}
