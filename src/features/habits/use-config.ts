import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { Habit, OutcomeMetric, PenaltyItem } from '@/types/database';

async function fetchConfig(userId: string) {
  const [habitsRes, outcomesRes, penaltiesRes] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .order('sort_order'),
    supabase.from('outcome_metrics').select('*').eq('user_id', userId).order('sort_order'),
    supabase.from('penalty_items').select('*').eq('user_id', userId).order('sort_order'),
  ]);
  if (habitsRes.error) return { data: null, error: habitsRes.error };
  if (outcomesRes.error) return { data: null, error: outcomesRes.error };
  if (penaltiesRes.error) return { data: null, error: penaltiesRes.error };
  const habits = habitsRes.data as Habit[];
  return {
    data: {
      identityHabits: habits.filter((h) => h.type === 'identity'),
      executionHabits: habits.filter((h) => h.type === 'execution'),
      outcomes: outcomesRes.data as OutcomeMetric[],
      penalties: penaltiesRes.data as PenaltyItem[],
    },
    error: null,
  };
}

export function useConfig() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['config', user?.id],
    queryFn: () => fetchConfig(user!.id),
    enabled: !!user,
    select: (res) => res.data,
  });
}
