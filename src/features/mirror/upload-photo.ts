import { readAsStringAsync } from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import type { MirrorPhoto } from '@/types/database';

export async function uploadMirrorPhoto(
  userId: string,
  localUri: string,
  date: string,
  dayNumber: number,
  checkinId?: string,
): Promise<{ data: MirrorPhoto | null; error: Error | null }> {
  const storagePath = `${userId}/${date}.jpg`;
  let base64: string;
  try {
    // Base64 encoding is required because the Supabase Storage JS client upload() method needs a binary buffer, not a data URI string
    base64 = await readAsStringAsync(localUri, { encoding: 'base64' });
  } catch {
    return { data: null, error: new Error('Failed to read image file') };
  }

  const binaryStr = globalThis.atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const { error: uploadError } = await supabase.storage
    .from('mirror-photos')
    .upload(storagePath, bytes, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) return { data: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from('mirror-photos').getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('mirror_photos')
    .upsert(
      {
        user_id: userId,
        checkin_id: checkinId ?? null,
        date,
        day_number: dayNumber,
        photo_url: publicUrl,
      },
      { onConflict: 'user_id,date' },
    )
    .select()
    .single();
  if (error) return { data: null, error };
  return { data: data as MirrorPhoto, error: null };
}
