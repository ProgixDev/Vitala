import { z } from 'zod';

/**
 * Central environment schema. The app refuses to boot if required vars are
 * missing or malformed — no more "undefined leaked into a Stripe call".
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),

  // Comma-separated list of allowed browser/app origins for CORS.
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:8081'),

  // --- Supabase ---
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  // Server-only. NEVER ship to a client. Bypasses RLS for trusted admin ops.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Used to verify Supabase-issued JWTs locally (Project Settings → API → JWT Secret).
  SUPABASE_JWT_SECRET: z.string().min(1),

  // --- Stripe (handed over separately) ---
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PUBLISHABLE_KEY: z.string().default(''),

  // --- Twilio (SMS) ---
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_PHONE_NUMBER: z.string().default(''),

  // --- Email (SMTP) ---
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASSWORD: z.string().default(''),
  EMAIL_FROM: z.string().default('Vitala <noreply@vitala.com>'),

  // --- Storage bucket names (Supabase Storage) ---
  STORAGE_BUCKET_AVATARS: z.string().default('avatars'),
  STORAGE_BUCKET_NURSE_DOCS: z.string().default('nurse-docs'),
  STORAGE_BUCKET_RECEIPTS: z.string().default('receipts'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
