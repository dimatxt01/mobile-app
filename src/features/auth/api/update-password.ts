import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UpdatePasswordResult = { error: null } | { error: AuthError | Error };

export async function updatePassword(newPassword: string): Promise<UpdatePasswordResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error };
  return { error: null };
}
