import type { IncomingMessage, ServerResponse } from 'http';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

// IMPORTANT: import the COMPILED output (produced by `nest build` via tsc),
// not the TypeScript source. Vercel bundles this file with esbuild, which does
// not emit `emitDecoratorMetadata` — compiling Nest's decorated classes here
// would silently break dependency injection. The precompiled `dist/` keeps the
// reflection metadata that Nest needs.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createApp } = require('../dist/create-app') as typeof import('../src/create-app');

// Cached across warm serverless invocations so we only bootstrap Nest once
// per container (cold start), not on every request.
let readyApp: Promise<NestFastifyApplication> | undefined;

function getApp(): Promise<NestFastifyApplication> {
  if (!readyApp) {
    readyApp = (async () => {
      const app = await createApp();
      // Initialise the DI container + register Fastify routes WITHOUT opening
      // a TCP listener (Vercel owns the socket).
      await app.init();
      await app.getHttpAdapter().getInstance().ready();
      return app;
    })();
  }
  return readyApp;
}

/**
 * Vercel Node serverless entrypoint. Every request under this project's routes
 * is funnelled here (see `vercel.json` rewrites) and handed to the underlying
 * Fastify server instance.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await getApp();
  const instance = app.getHttpAdapter().getInstance();
  instance.server.emit('request', req, res);
}
