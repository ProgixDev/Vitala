import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../config/env';

/**
 * Two flavours of client:
 *
 *  - admin(): uses the service-role key and BYPASSES RLS. Use only for trusted
 *    server-side operations (webhooks, cross-user admin reads, seeding).
 *
 *  - forUser(token): uses the anon key but forwards the caller's JWT, so every
 *    query runs under that user's RLS policies. This is the default for
 *    request-scoped work — the database itself enforces "patients see only
 *    their rows".
 */
@Injectable()
export class SupabaseService {
  private readonly url: string;
  private readonly anonKey: string;
  private readonly adminClient: SupabaseClient;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.url = this.config.get('SUPABASE_URL', { infer: true });
    this.anonKey = this.config.get('SUPABASE_ANON_KEY', { infer: true });
    const serviceKey = this.config.get('SUPABASE_SERVICE_ROLE_KEY', {
      infer: true,
    });
    this.adminClient = createClient(this.url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  /** Service-role client — bypasses RLS. Handle with care. */
  admin(): SupabaseClient {
    return this.adminClient;
  }

  /** Request-scoped client that runs under the caller's RLS policies. */
  forUser(accessToken: string): SupabaseClient {
    return createClient(this.url, this.anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
