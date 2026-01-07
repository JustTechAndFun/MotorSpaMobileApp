import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiOperation, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
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
    @ApiOperation({
        summary: 'Đăng ký tài khoản mới',
        description: 'Tạo tài khoản mới với email và password. Trả về access token và refresh token sau khi đăng ký thành công.'
    })
    @ApiCreatedResponse({ description: 'User registered and tokens issued' })
    @ApiBadRequestResponse({ description: 'Email already exists or invalid data' })
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Post('login')
    @ApiOperation({
        summary: 'Đăng nhập',
        description: 'Đăng nhập bằng email và password. Trả về access token và refresh token.'
    })
    @ApiOkResponse({ description: 'User authenticated, returns tokens' })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({
        summary: 'Đăng nhập Google (Web)',
        description: 'Redirect đến trang đăng nhập Google OAuth. Dành cho web browser.'
    })
    @ApiOkResponse({ description: 'Redirects to Google OAuth' })
    async googleAuth() {
        // Guard redirects to Google
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({
        summary: 'Google OAuth callback',
        description: 'Endpoint nhận callback từ Google sau khi user đăng nhập thành công. Tạo/update user và trả về tokens.'
    })
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
    @ApiOperation({
        summary: 'Đăng nhập Google (Mobile)',
        description: 'Xác thực Google ID Token từ mobile app (React Native, Flutter). Client gửi idToken sau khi đăng nhập với Google SDK.'
    })
    @ApiCreatedResponse({ description: 'Authenticate with Google ID Token from mobile app' })
    @ApiBadRequestResponse({ description: 'Invalid Google ID Token' })
    @ApiBody({ type: GoogleSignInDto })
    async googleMobileAuth(@Body() dto: GoogleSignInDto) {
        return this.auth.verifyGoogleToken(dto.idToken);
    }

    @Post('refresh')
    @ApiOperation({
        summary: 'Làm mới access token',
        description: 'Sử dụng refresh token để lấy access token và refresh token mới khi access token hết hạn.'
    })
    @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
    @ApiOkResponse({ description: 'New access & refresh tokens' })
    @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
    refresh(@Body('refreshToken') refreshToken: string) {
        return this.auth.refreshTokens(refreshToken);
    }

    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Đăng xuất',
        description: 'Đăng xuất và vô hiệu hóa refresh token của user.'
    })
    @ApiOkResponse({ description: 'User logged out (refresh token invalidated)' })
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: Request & { user?: { id: string } }) {
        const id = req?.user?.id;
        return this.auth.logout(id || '');
    }
}
