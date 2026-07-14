import { supabase } from '@/lib/supabase';
import { Endpoints } from '@/lib/endpoints';

type Bucket = 'avatars' | 'nurse-docs' | 'receipts';

/**
 * Upload a local image URI to Supabase Storage via a server-signed URL and
 * return the stored object path. Best-effort: throws on failure so callers can
 * decide whether to block.
 */
export async function uploadImage(bucket: Bucket, localUri: string): Promise<string> {
  const filename = localUri.split('/').pop() ?? `image-${bucket}.jpg`;
  const signed = await Endpoints.signUpload(bucket, filename);

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(signed.path, signed.token ?? '', arrayBuffer, {
      contentType: 'image/jpeg',
    });
  if (error) throw error;

  return signed.path;
}
