import { supabase } from '@/lib/supabase';

export async function uploadWeeklyPhoto(
  userId: string,
  localUri: string,
  weekStart: string,
): Promise<{ data: string | null; error: Error | null }> {
  const timestamp = Date.now();
  const storagePath = `${userId}/${weekStart}/${timestamp}.jpg`;

  let blob: Blob;
  try {
    const response = await fetch(localUri);
    blob = await response.blob();
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Failed to read image file') };
  }

  const { error: uploadError } = await supabase.storage
    .from('weekly-review-photos')
    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) return { data: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from('weekly-review-photos').getPublicUrl(storagePath);

  return { data: publicUrl, error: null };
}
