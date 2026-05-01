import { useAuthStore } from '@/features/auth/store/auth-store';
import { signIn } from '@/features/auth/api/sign-in';
import { signUp } from '@/features/auth/api/sign-up';
import { signOut } from '@/features/auth/api/sign-out';
import { signInWithGoogle } from '@/features/auth/api/oauth-google';
import { resetPassword } from '@/features/auth/api/reset-password';
import { updatePassword } from '@/features/auth/api/update-password';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return {
    session,
    user,
    isLoading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };
}
