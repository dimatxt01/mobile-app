import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, isLoading: false, isInitialized: true }),
  clear: () => set({ session: null, user: null, isLoading: false, isInitialized: true }),
}));

// Subscribe to Supabase auth events for the app lifetime.
// INITIAL_SESSION fires on startup (possibly after async SecureStore read),
// which is why isInitialized starts false.
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
