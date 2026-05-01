/* eslint-disable import/first */
// jest.mock must appear before imports so Jest can hoist it correctly.
jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

import { useAuthStore } from '../src/features/auth/store/auth-store';
import type { Session, User } from '@supabase/supabase-js';
/* eslint-enable import/first */

function makeSession(email: string): Session {
  return {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User,
  } as Session;
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null, user: null, isLoading: true, isInitialized: false });
  });

  it('starts uninitialized', () => {
    expect(useAuthStore.getState().isInitialized).toBe(false);
  });

  it('setSession marks initialized and sets user', () => {
    const session = makeSession('test@example.com');
    useAuthStore.getState().setSession(session);
    const state = useAuthStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.session).toBe(session);
    expect(state.user?.email).toBe('test@example.com');
  });

  it('setSession(null) clears user and marks initialized', () => {
    useAuthStore.getState().setSession(makeSession('x@x.com'));
    useAuthStore.getState().setSession(null);
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isInitialized).toBe(true);
  });

  it('clear resets session and user', () => {
    useAuthStore.getState().setSession(makeSession('x@x.com'));
    useAuthStore.getState().clear();
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
