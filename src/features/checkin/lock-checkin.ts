import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';

type LockArgs = {
  checkinId: string;
  identityScore: number;
  executionScore: number;
  outcomeScore: number;
  penaltyScore: number;
};

export function useLockCheckin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: LockArgs) => {
      const { data, error } = await supabase.rpc('lock_checkin', {
        p_checkin_id: args.checkinId,
        p_identity_score: args.identityScore,
        p_execution_score: args.executionScore,
        p_outcome_score: args.outcomeScore,
        p_penalty_score: args.penaltyScore,
      });
      if (error) return { data: null, error };
      return { data: data as number, error: null };
    },
    onSuccess: () => {
      const date = new Date().toISOString().slice(0, 10);
      qc.invalidateQueries({ queryKey: ['checkin', user?.id, date] });
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
