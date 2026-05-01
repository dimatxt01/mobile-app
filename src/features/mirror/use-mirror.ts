import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { MirrorPhoto } from '@/types/database';

export function useMirror() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['mirror', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mirror_photos')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) return { data: null, error };
      return { data: data as MirrorPhoto[], error: null };
    },
    enabled: !!user,
    select: (res) => res.data,
  });
}
