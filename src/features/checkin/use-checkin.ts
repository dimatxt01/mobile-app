import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { DailyCheckin } from '@/types/database';

export function useCheckin() {
  const { user } = useAuth();
  const date = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ['checkin', user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', date)
        .maybeSingle();
      if (error) return { data: null, error };
      return { data: data as DailyCheckin | null, error: null };
    },
    enabled: !!user,
    select: (res) => res.data,
  });
}
