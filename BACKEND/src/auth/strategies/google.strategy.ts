import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly config: ConfigService) {
        const clientID = config.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL');

        // Skip Google OAuth if credentials are not configured
        if (!clientID || !clientSecret || !callbackURL || 
            clientID === 'your_google_client_id_here' || 
            clientSecret === 'your_google_client_secret_here') {
            console.warn('Google OAuth credentials not configured. Google login will be disabled.');
            // Provide dummy values to satisfy passport constructor
            super({
                clientID: 'dummy',
                clientSecret: 'dummy',
                callbackURL: 'http://localhost:3000/auth/google/callback',
                scope: ['email', 'profile'],
            });
            return;
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;
        const user = {
            googleId: id,
            email: emails && emails[0]?.value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            picture: photos && photos[0]?.value,
            accessToken,
        };
        done(null, user);
    }
}
