import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';

export type HistoryRow = {
  id: string;
  date: string;
  total_score: number;
  identity_score: number;
  execution_score: number;
  outcome_score: number;
  penalty_score: number;
  whoop_score_adj: number;
  reflection_win: string | null;
  reflection_broke: string | null;
  is_late_checkin: boolean;
};

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
