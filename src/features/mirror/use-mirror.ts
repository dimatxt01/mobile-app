import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { MirrorPhoto } from '@/types/database';

export function useMirror() {
  const { user } = useAuth();
  return useQuery<MirrorPhoto[]>({
    queryKey: ['mirror', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mirror_photos')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}
