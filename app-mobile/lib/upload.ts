import * as ImagePicker from 'expo-image-picker';
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

/**
 * Prompt the user to pick a square avatar image, upload it to the `avatars`
 * bucket, and return its public URL. Returns null if the user cancels.
 * Falls back to the local URI if the upload itself fails so the UI can still
 * preview the chosen image.
 */
export async function pickAndUploadAvatar(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
  });
  const uri = result.assets?.[0]?.uri;
  if (result.canceled || !uri) return null;
  try {
    const path = await uploadImage('avatars', uri);
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return uri;
  }
}
