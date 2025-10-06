import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // CORS configuration
  const rawOrigins = configService.get<string>('CORS_ORIGINS', '');
  const originList = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter((o) => !!o);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || originList.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Swagger configuration
  const swaggerTitle = configService.get<string>('SWAGGER_TITLE', 'API');
  const swaggerDesc = configService.get<string>(
    'SWAGGER_DESCRIPTION',
    'API Documentation',
  );
  const swaggerVersion = configService.get<string>('SWAGGER_VERSION', '1.0');
  const swaggerPrefix = configService.get<string>('SWAGGER_PREFIX', 'api-docs');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDesc)
    .setVersion(swaggerVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPrefix, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  // Optional: log the URL for convenience
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/${swaggerPrefix}`);
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});
