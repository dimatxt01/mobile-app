import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { DailyCheckin } from '@/types/database';

type SavePayload = Partial<
  Pick<
    DailyCheckin,
    'identity_checks' | 'execution_checks' | 'perf_9to5' | 'outcome_scores' | 'penalty_scores'
  >
>;

export function useSaveCheckin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: SavePayload) => {
      const date = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('daily_checkins')
        .upsert({ user_id: user!.id, date, ...payload }, { onConflict: 'user_id,date' })
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: data as DailyCheckin, error: null };
    },
    onSuccess: () => {
      const date = new Date().toISOString().slice(0, 10);
      qc.invalidateQueries({ queryKey: ['checkin', user?.id, date] });
    },
  });

  const save = useCallback(
    (payload: SavePayload) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => mutation.mutate(payload), 800);
    },
    [mutation],
  );

  return { save, isPending: mutation.isPending };
}
