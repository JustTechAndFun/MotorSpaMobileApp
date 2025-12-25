import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleSignInDto } from './dto/google-signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard';
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

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    @ApiOkResponse({ description: 'Redirects to Google OAuth' })
    async googleAuth() {
        // Guard redirects to Google
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOkResponse({ description: 'Google OAuth callback, returns tokens' })
    async googleAuthCallback(@Req() req: Request & { user?: any }) {
        const googleUser = req.user;
        return this.auth.googleLogin({
            googleId: googleUser.googleId,
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            picture: googleUser.picture,
        });
    }

    @Post('google/mobile')
    @ApiCreatedResponse({ description: 'Authenticate with Google ID Token from mobile app' })
    @ApiBody({ type: GoogleSignInDto })
    async googleMobileAuth(@Body() dto: GoogleSignInDto) {
        return this.auth.verifyGoogleToken(dto.idToken);
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
