import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ROLE } from '../../user/enum/role';

export interface JwtPayload {
    sub: string;
    role: ROLE;
    iat?: number;
    exp?: number;
}

export interface RequestUser {
    id: string;
    role: ROLE;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        const secret = config.get<string>('JWT_ACCESS_SECRET');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret || 'access_fallback_secret',
        });
    }

    validate(payload: JwtPayload): RequestUser {
        return { id: payload.sub, role: payload.role };
    }
}