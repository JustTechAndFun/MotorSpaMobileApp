import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ROLE } from '../user/enum/role';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UserService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        // phone unique check
        const exists = await this.users.findByPhone(dto.phone);
        if (exists) throw new ConflictException('Phone already registered');
        const created = await this.users.create(
            { phone: dto.phone, name: dto.name, password: dto.password },
            ROLE.ADMIN, // bypass role check by passing ADMIN for default customer creation
        );
        const tokens = await this.generateTokens(created.id, created.role);
        const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.users.setHashedRefreshToken(created.id, refreshHash);
        return { user: created, ...tokens };
    }

    async login(dto: LoginDto) {
        const user = await this.users.findByPhone(dto.phone);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) throw new UnauthorizedException('Invalid credentials');
        const tokens = await this.generateTokens(user.id, user.role);
        const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.users.setHashedRefreshToken(user.id, refreshHash);
        const safe = this.stripSensitive(user);
        return { user: safe, ...tokens };
    }

    async refreshTokens(refreshToken: string) {
        if (!refreshToken) throw new ForbiddenException('Refresh token required');
        try {
            const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            });
            const userRaw: any = await this.users.findOneRaw(payload.sub);
            if (!userRaw || !userRaw.hashedRefreshToken) {
                throw new ForbiddenException('Access denied');
            }
            const match = await bcrypt.compare(refreshToken, userRaw.hashedRefreshToken);
            if (!match) throw new ForbiddenException('Access denied');
            const tokens = await this.generateTokens(payload.sub, payload.role);
            const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
            await this.users.setHashedRefreshToken(payload.sub, newRefreshHash);
            return tokens;
        } catch (e) {
            throw new ForbiddenException('Invalid refresh token');
        }
    }

    async logout(userId: string) {
        await this.users.setHashedRefreshToken(userId, null);
        return { success: true };
    }

    private async generateTokens(sub: string, role: ROLE) {
        const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
        const accessExpiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES', '25h');
        const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES', '90d');
        const payload = { sub, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, { secret: accessSecret, expiresIn: accessExpiresIn }),
            this.jwt.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExpiresIn }),
        ]);
        return { accessToken, refreshToken };
    }

    private stripSensitive(user: any) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, hashedRefreshToken, ...rest } = user;
        return rest;
    }
}
