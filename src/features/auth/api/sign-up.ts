import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SignUpResult =
  | { data: { user: User; session: Session | null; needsConfirmation: boolean }; error: null }
  | { data: null; error: AuthError | Error };

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error || !data.user) {
    return { data: null, error: error ?? new Error('No user returned') };
  }

  // session is null when email confirmation is required
  return {
    data: {
      user: data.user,
      session: data.session,
      needsConfirmation: !data.session,
    },
    error: null,
  };
}
