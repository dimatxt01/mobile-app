import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { todayDate } from '@/lib/date';

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
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      const date = todayDate();
      qc.invalidateQueries({ queryKey: ['checkin', user?.id, date] });
      qc.invalidateQueries({ queryKey: ['history'] });
    },
    onError: () => {
      Alert.alert('Lock Failed', "Could not lock today's check-in. Please try again.");
    },
  });
}
