import { create } from 'zustand';
import type { Profile } from '@/types/database';

type ProfileState = {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (p: Profile | null) => void;
  setLoading: (v: boolean) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (p) => set({ profile: p, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),
}));
