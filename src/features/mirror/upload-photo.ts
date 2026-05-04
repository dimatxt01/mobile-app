import { supabase } from '@/lib/supabase';

export async function uploadMirrorPhoto(
  userId: string,
  localUri: string,
  date: string,
  dayNumber: number,
): Promise<{ data: string | null; error: Error | null }> {
  const storagePath = `${userId}/${date}.jpg`;

  let blob: Blob;
  try {
    const response = await fetch(localUri);
    blob = await response.blob();
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Failed to read image file') };
  }

  const { error: uploadError } = await supabase.storage
    .from('mirror-photos')
    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) return { data: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from('mirror-photos').getPublicUrl(storagePath);

  const { error: insertError } = await supabase.from('mirror_photos').insert({
    user_id: userId,
    date,
    day_number: dayNumber,
    photo_url: publicUrl,
  });
  if (insertError) return { data: null, error: insertError };

  return { data: publicUrl, error: null };
}
