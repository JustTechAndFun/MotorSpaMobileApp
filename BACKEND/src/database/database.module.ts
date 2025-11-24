import { Module } from '@nestjs/common';
import * as fs from 'fs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// In a larger project you might separate config; keeping inline for simplicity

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('DB_HOST', 'localhost'),
                port: parseInt(config.get<string>('DB_PORT', '5432')),
                username: config.get<string>('DB_USERNAME', 'postgres'),
                password: config.get<string>('DB_PASSWORD', 'postgres'),
                database: config.get<string>('DB_NAME', 'postgres'),
                autoLoadEntities: true,
                synchronize: true, // Turn off in production and use migrations.
                logging: config.get<string>('NODE_ENV') !== 'production',
                ssl: (() => {
                    const enabled = config.get<string>('DB_SSL', 'false').toLowerCase() === 'true';
                    if (!enabled) return false;
                    const rejectUnauthorized = config.get<string>('DB_SSL_REJECT_UNAUTHORIZED', 'true').toLowerCase() === 'true';
                    const caPath = config.get<string>('DB_SSL_CA_PATH');
                    if (caPath) {
                        try {
                            const caContent = fs.readFileSync(caPath, { encoding: 'utf8' });
                            return { rejectUnauthorized, ca: caContent };
                        } catch {
                            return { rejectUnauthorized };
                        }
                    }
                    return { rejectUnauthorized };
                })(),
            }),
        }),
    ],
})
export class DatabaseModule { }
