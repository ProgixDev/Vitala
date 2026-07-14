# Vitala API (NestJS + Fastify + Supabase)

Clean rebuild of the Vitala backend. One Postgres database and one identity
system (Supabase Auth) serve **both** the mobile app and the admin dashboard —
replacing the old split of MongoDB/JWT (mobile) vs Postgres/Better-Auth (web).

## Stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | NestJS 11 on **Fastify**                           |
| Identity       | **Supabase Auth** (JWT verified per request)       |
| Data access    | `@supabase/supabase-js` + SQL, enforced by **RLS** |
| File storage   | **Supabase Storage** (was Cloudinary)              |
| Realtime       | **Supabase Realtime** on rows (was Socket.IO)      |
| Payments       | Stripe                                             |
| SMS / Email    | Twilio / Nodemailer                                |
| Push           | Expo Server SDK                                    |

## Architecture

- **Guards run globally.** `SupabaseAuthGuard` validates the bearer token and
  attaches `req.user` (`id`, `email`, `role`); `RolesGuard` enforces `@Roles()`.
  Routes opt out with `@Public()`.
- **Two Supabase clients** (`SupabaseService`):
  - `forUser(token)` — request-scoped, runs under the caller's **RLS** policies.
    This is the default for user-facing reads/writes.
  - `admin()` — service-role, bypasses RLS. Used only for trusted server work
    (Stripe webhooks, cross-user notifications, admin aggregates).
- **RLS is defense-in-depth** beneath the guards: patients see only their rows,
  nurses see rows assigned to them, admins see everything.
- **One error shape** via `AllExceptionsFilter` — controllers just `throw`.
- **Validated env** (`config/env.ts`, zod) — the app refuses to boot if misconfigured.

## Project layout

```
src/
  main.ts                  Fastify bootstrap, Helmet, CORS allow-list, validation
  config/env.ts            zod-validated environment
  common/                  guards, decorators (@CurrentUser/@Roles/@Public), filter
  supabase/                SupabaseService (admin + per-user RLS clients)
  integrations/            stripe · twilio · email · push (global)
  modules/
    profiles/              /me, medical, nurse, locations, settings, /nurses
    services/              service catalog (admin-managed)
    appointments/          booking + status state-machine + nurse assignment
    payments/              Stripe intents, webhook, transactions, refunds
    reviews/               patient -> nurse reviews + rating rollup
    notifications/         in-app + Expo push
    emergency/             SOS requests + emergency contacts
    storage/               signed upload URLs (Supabase Storage)
supabase/migrations/       0001 schema · 0002 RLS + buckets · 0003 seed services
```

## Setup

1. **Create a Supabase project** for Vitala (or hand over the URL + keys).
2. `cp .env.example .env` and fill in:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
     `SUPABASE_JWT_SECRET` (Project Settings → API)
   - `STRIPE_*` (handed over separately), plus Twilio/email as needed.
3. **Apply migrations** — run the three files in `supabase/migrations/` in order,
   via the Supabase SQL editor, the Supabase CLI (`supabase db push`), or the
   MCP `apply_migration` tool.
4. `npm install`
5. `npm run start:dev` → API on `http://localhost:4000`, health at `/health`.

## Auth model

Clients authenticate **directly with Supabase Auth** (sign-up / login / email
verification / OTP / password reset are all Supabase-native — no custom flows).
Role is set in the user's `app_metadata.role` at sign-up; a Postgres trigger
(`handle_new_user`) auto-creates the matching `profiles` row (+ settings, +
patient/nurse sub-profile). The API only ever **validates** the token.

## Notes

- The old Express server under `/server` is kept for reference and can be retired
  once the mobile app and dashboard are pointed here.
- No user/appointment seed ships in SQL (users must exist in `auth.users` first);
  seed those through the Supabase Auth admin API or the dashboard.
