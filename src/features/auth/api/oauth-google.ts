import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type OAuthResult = { error: null } | { error: AuthError | Error };

export async function signInWithGoogle(): Promise<OAuthResult> {
  // In Expo Go (__DEV__), Supabase redirects back via the Expo proxy.
  // In a standalone build, we use the app's custom scheme directly.
  const redirectTo = makeRedirectUri({
    scheme: __DEV__ ? undefined : 'coolify-ai',
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return { error: error ?? new Error('Failed to get OAuth URL') };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') {
    return { error: new Error('OAuth flow cancelled or failed') };
  }

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
  if (sessionError) return { error: sessionError };

  return { error: null };
}
