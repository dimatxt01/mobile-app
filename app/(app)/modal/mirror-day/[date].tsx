import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import type { MirrorPhoto, DailyCheckin } from '@/types/database';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MirrorDayScreen() {
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['mirror-day', user?.id, date],
    queryFn: async () => {
      const [photoRes, checkinRes] = await Promise.all([
        supabase
          .from('mirror_photos')
          .select('*')
          .eq('user_id', user!.id)
          .eq('date', date!)
          .maybeSingle(),
        supabase
          .from('daily_checkins')
          .select('total_score')
          .eq('user_id', user!.id)
          .eq('date', date!)
          .maybeSingle(),
      ]);
      return {
        photo: photoRes.data as MirrorPhoto | null,
        score: (checkinRes.data as Pick<DailyCheckin, 'total_score'> | null)?.total_score ?? null,
      };
    },
    enabled: !!user && !!date,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data?.photo && <Image source={{ uri: data.photo.photo_url }} style={styles.fullImage} />}
      <View style={[styles.overlay, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.infoRow}>
          <Text style={styles.dateText}>{date}</Text>
          {data?.score != null && <Text style={styles.scoreText}>{data.score} PTS</Text>}
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.topClose, { top: insets.top + 12 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.xBtn}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  centered: { alignItems: 'center', justifyContent: 'center' },
  fullImage: { width: SCREEN_WIDTH, height: '100%', position: 'absolute' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.pagePad,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontFamily: fonts.mono, fontSize: 14, color: colors.textPrimary, letterSpacing: 1.5 },
  scoreText: {
    fontFamily: fonts.monoBold,
    fontSize: 18,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
  },
  closeBtn: { alignItems: 'center', marginTop: 16, paddingVertical: 12 },
  closeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
  topClose: { position: 'absolute', right: 16 },
  xBtn: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary },
});
