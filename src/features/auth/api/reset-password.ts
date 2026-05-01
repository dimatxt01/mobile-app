import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type ResetPasswordResult = { error: null } | { error: AuthError | Error };

export async function resetPassword(email: string): Promise<ResetPasswordResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'coolify-ai://reset-password',
  });
  if (error) return { error };
  return { error: null };
}
