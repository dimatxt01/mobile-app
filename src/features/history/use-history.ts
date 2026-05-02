import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { Database } from '@/types/database';

export type HistoryRow = Database['public']['Functions']['get_history']['Returns'][number];

export function useHistory(days = 30) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['history', user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_history', { p_days: days });
      if (error) return { data: null as HistoryRow[] | null, error };
      return { data: (data ?? []) as HistoryRow[], error: null };
    },
    enabled: !!user,
    select: (res) => res.data,
  });
}
