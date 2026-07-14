import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import type { Env } from '../../config/env';

/**
 * Supabase Storage helper (replaces Cloudinary). Files are namespaced under the
 * owner's uid (e.g. `<uid>/front.jpg`) so Storage RLS policies apply.
 */
@Injectable()
export class StorageService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** Returns a short-lived signed upload URL the client uploads directly to. */
  async createSignedUploadUrl(bucket: string, path: string) {
    const { data, error } = await this.supabase
      .admin()
      .storage.from(bucket)
      .createSignedUploadUrl(path);
    if (error) throw error;
    return data; // { signedUrl, token, path }
  }

  /** Signed download URL for private buckets (nurse docs, receipts). */
  async createSignedDownloadUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await this.supabase
      .admin()
      .storage.from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }

  publicUrl(bucket: string, path: string): string {
    return this.supabase.admin().storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  get buckets() {
    return {
      avatars: this.config.get('STORAGE_BUCKET_AVATARS', { infer: true }),
      nurseDocs: this.config.get('STORAGE_BUCKET_NURSE_DOCS', { infer: true }),
      receipts: this.config.get('STORAGE_BUCKET_RECEIPTS', { infer: true }),
    };
  }
}
