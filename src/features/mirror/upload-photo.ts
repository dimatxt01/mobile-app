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

  let blob: Blob;
  try {
    // fetch() in React Native/Expo handles file:// URIs and returns a proper Blob
    const response = await fetch(localUri);
    blob = await response.blob();
  } catch (e) {
    return { data: null, error: new Error('Failed to read image file') };
  }

  const { error: uploadError } = await supabase.storage
    .from('mirror-photos')
    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });
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
