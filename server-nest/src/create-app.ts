import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import type { Env } from './config/env';

/**
 * Builds and configures the Nest application WITHOUT starting a listener.
 *
 * Shared by both entrypoints:
 *  - `main.ts`      → local/traditional server (calls `app.listen`)
 *  - `api/index.ts` → Vercel serverless handler (calls `app.init` + emits requests)
 *
 * Keeping the wiring here guarantees both runtimes get identical security
 * headers, CORS, validation and error handling.
 */
export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    // Preserve the raw request body so Stripe webhook signatures can be verified.
    { rawBody: true },
  );

  const config = app.get(ConfigService<Env, true>);

  // Security headers.
  await app.register(helmet as never);

  // Explicit CORS allow-list (fixes the old server's "reflect any origin").
  const origins = config
    .get('CORS_ORIGINS', { infer: true })
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global input validation + payload stripping for every DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Single, consistent error shape across the whole API.
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api', { exclude: ['health'] });

  return app;
}
