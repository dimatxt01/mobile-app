import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { uploadWeeklyPhoto } from '@/features/reviews/upload-weekly-photo';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import type { WeeklyReview } from '@/types/database';

const MAX_PHOTOS = 5;

export default function WeeklyReviewScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const qc = useQueryClient();
  const {
    readOnly,
    weekStart: paramWeekStart,
    weekEnd: paramWeekEnd,
  } = useLocalSearchParams<{
    readOnly?: string;
    weekStart?: string;
    weekEnd?: string;
  }>();
  const isReadOnly = readOnly === '1';

  const now = new Date();
  const dayOfWeek = now.getDay();
  const computedWeekStart = new Date(now);
  computedWeekStart.setDate(now.getDate() - dayOfWeek);
  const weekStart = paramWeekStart ?? computedWeekStart.toISOString().slice(0, 10);
  const computedWeekEnd = new Date(computedWeekStart);
  computedWeekEnd.setDate(computedWeekStart.getDate() + 6);
  const weekEnd = paramWeekEnd ?? computedWeekEnd.toISOString().slice(0, 10);

  const [win, setWin] = useState('');
  const [challenge, setChallenge] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [localPhotoUris, setLocalPhotoUris] = useState<string[]>([]);
  const [savedPhotoUrls, setSavedPhotoUrls] = useState<string[]>([]);

  const { data: existingReview } = useQuery({
    queryKey: ['weekly-review', user?.id, weekStart],
    queryFn: async () => {
      const { data } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', user!.id)
        .eq('week_start', weekStart)
        .maybeSingle();
      return data as WeeklyReview | null;
    },
    enabled: !!user && !!weekStart,
  });

  useEffect(() => {
    if (!existingReview) return;
    setWin(existingReview.win ?? '');
    setChallenge(existingReview.challenge ?? '');
    setNextWeek(existingReview.next_week ?? '');
    setSavedPhotoUrls(existingReview.photo_urls ?? []);
  }, [existingReview]);

  const handleAddPhoto = async () => {
    if (localPhotoUris.length + savedPhotoUrls.length >= MAX_PHOTOS) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhotoUris((prev) => [...prev, result.assets[0]!.uri]);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const uploadedUrls: string[] = [];
      for (const uri of localPhotoUris) {
        const { data: url, error } = await uploadWeeklyPhoto(user.id, uri, weekStart);
        if (error) throw error;
        if (url) uploadedUrls.push(url);
      }
      const { error: upsertError } = await supabase.from('weekly_reviews').upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          week_end: weekEnd,
          win,
          challenge,
          next_week: nextWeek,
          photo_urls: [...savedPhotoUrls, ...uploadedUrls],
        },
        { onConflict: 'user_id,week_start' },
      );
      if (upsertError) throw upsertError;
    },
    onError: (err: Error) => Alert.alert('Save Failed', err.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weekly-reviews'] });
      qc.invalidateQueries({ queryKey: ['weekly-review', user!.id, weekStart] });
      router.back();
    },
  });

  const weekStartDate = new Date(weekStart + 'T00:00:00');
  const weekEndDate = new Date(weekEnd + 'T00:00:00');
  const fmtRange = `${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}–${weekEndDate.toLocaleDateString('en-US', { day: 'numeric' })}`;

  const allPhotos = [...savedPhotoUrls, ...localPhotoUris];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.dragHandle} />
      <Eyebrow label={isReadOnly ? `WK OF ${fmtRange}` : 'WEEKLY CHECK-UP'} />

      <View style={styles.card}>
        <Text style={styles.label}>Big win this week</Text>
        {isReadOnly ? (
          <Text style={styles.readOnlyText}>{win || '—'}</Text>
        ) : (
          <TextInput
            style={styles.input}
            value={win}
            onChangeText={setWin}
            multiline
            placeholderTextColor={colors.textTertiary}
            placeholder="What went well?"
          />
        )}
        <Text style={styles.label}>Biggest challenge</Text>
        {isReadOnly ? (
          <Text style={styles.readOnlyText}>{challenge || '—'}</Text>
        ) : (
          <TextInput
            style={styles.input}
            value={challenge}
            onChangeText={setChallenge}
            multiline
            placeholderTextColor={colors.textTertiary}
            placeholder="What was hard?"
          />
        )}
        <Text style={styles.label}>Intention for next week</Text>
        {isReadOnly ? (
          <Text style={styles.readOnlyText}>{nextWeek || '—'}</Text>
        ) : (
          <TextInput
            style={styles.input}
            value={nextWeek}
            onChangeText={setNextWeek}
            multiline
            placeholderTextColor={colors.textTertiary}
            placeholder="What will you focus on?"
          />
        )}
      </View>

      {(allPhotos.length > 0 || !isReadOnly) && (
        <View style={styles.photoSection}>
          <Eyebrow label="PHOTOS OF THE WEEK" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
            contentContainerStyle={{ gap: 8 }}
          >
            {allPhotos.map((uri, i) => (
              <Image key={`${uri}-${i}`} source={{ uri }} style={styles.photoThumb} />
            ))}
            {!isReadOnly && allPhotos.length < MAX_PHOTOS && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                <Text style={styles.addPhotoPlus}>+</Text>
                <Text style={styles.addPhotoText}>ADD</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {isReadOnly ? (
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>CLOSE</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            <Text style={styles.saveText}>{saveMutation.isPending ? 'SAVING...' : 'SAVE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>SKIP</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.elevated, paddingHorizontal: spacing.pagePad },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderDefault,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  card: {
    marginTop: 16,
    backgroundColor: colors.surface02,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginTop: 16,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.high,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
  readOnlyText: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 8,
    lineHeight: 22,
  },
  photoSection: { marginTop: 24 },
  photoScroll: { marginTop: 12 },
  photoThumb: {
    width: 80,
    height: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.high,
  },
  addPhotoBtn: {
    width: 80,
    height: 100,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoPlus: {
    fontFamily: fonts.mono,
    fontSize: 20,
    color: colors.textTertiary,
  },
  addPhotoText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveText: { fontFamily: fonts.monoBold, fontSize: 14, letterSpacing: 1, color: colors.base },
  cancelBtn: { alignItems: 'center', marginTop: 16 },
  cancelText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  closeText: { fontFamily: fonts.monoBold, fontSize: 14, letterSpacing: 1, color: colors.textPrimary },
});
