import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { todayDate } from '@/lib/date';
import type { DailyCheckin } from '@/types/database';

// balance write volume vs. UI responsiveness
const SAVE_DEBOUNCE_MS = 800;

type SavePayload = Partial<
  Pick<
    DailyCheckin,
    | 'identity_checks'
    | 'execution_checks'
    | 'perf_9to5'
    | 'outcome_scores'
    | 'penalty_scores'
    | 'reflection_win'
    | 'reflection_broke'
    | 'reflection_tomorrow'
  >
>;

export function useSaveCheckin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: SavePayload) => {
      const date = todayDate();
      const { data, error } = await supabase
        .from('daily_checkins')
        .upsert({ user_id: user!.id, date, ...payload }, { onConflict: 'user_id,date' })
        .select()
        .single();
      if (error) throw error;
      return data as DailyCheckin;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['checkin', user?.id, data.date] });
    },
    onError: (e) => console.warn('[save-checkin] auto-save failed', e),
  });

  const save = useCallback(
    (payload: SavePayload) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => mutation.mutate(payload), SAVE_DEBOUNCE_MS);
    },
    [mutation],
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { save, cancel, isPending: mutation.isPending };
}
