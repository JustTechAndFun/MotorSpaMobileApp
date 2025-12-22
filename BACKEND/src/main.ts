import { NestFactory } from '@nestjs/core';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiResponseDto } from './common/dto/api-response.dto.js';
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

  console.log('CORS Origins configured:', originList);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (same-origin, mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Check if origin is in the allowed list
      if (originList.includes(origin)) {
        callback(null, true);
        return;
      }
      
      // Log rejected origin for debugging
      console.warn('CORS rejected origin:', origin);
      callback(null, false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global response shaping & error handling
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger configuration
  const swaggerTitle = configService.get<string>('SWAGGER_TITLE', 'API');
  const swaggerDesc = configService.get<string>(
    'SWAGGER_DESCRIPTION',
    'API Documentation',
  );
  const swaggerVersion = configService.get<string>('SWAGGER_VERSION', '1.0');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDesc)
    .setVersion(swaggerVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ApiResponseDto],
  });
  // Serve Swagger at root (no prefix). Note: This will override any existing GET '/' route.
  const swaggerPath = '';
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  // Optional: log the URL for convenience
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/`);
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});
