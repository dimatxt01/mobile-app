import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SignOutResult = { error: null } | { error: AuthError | Error };

export async function signOut(): Promise<SignOutResult> {
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) return { error };
  return { error: null };
}
