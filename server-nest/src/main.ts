import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createApp } from './create-app';
import type { Env } from './config/env';

/**
 * Traditional long-running server entrypoint (local dev, Docker, Railway, etc.).
 *
 * On Vercel this file is NOT used — the serverless handler lives in
 * `api/index.ts` and reuses the same `createApp()` wiring without `listen`.
 */
async function bootstrap() {
  const app = await createApp();

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });
  const host = config.get('HOST', { infer: true });

  await app.listen(port, host);
  Logger.log(`Vitala API listening on http://${host}:${port}`, 'Bootstrap');
}

void bootstrap();
