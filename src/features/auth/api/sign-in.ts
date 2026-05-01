import { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SignInResult =
  | { data: { session: Session }; error: null }
  | { data: null; error: AuthError | Error };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return { data: null, error: error ?? new Error('No session returned') };
  }
  return { data: { session: data.session }, error: null };
}
