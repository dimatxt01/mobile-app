import { useEffect, useState } from 'react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { uploadWeeklyPhoto } from '@/features/weekly-review/upload-weekly-photo';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/hmc/Eyebrow';

const THUMB = 80;

function computeCurrentWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    weekEnd: weekEnd.toISOString().slice(0, 10),
  };
}

export default function WeeklyReviewScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{
    weekStart?: string;
    weekEnd?: string;
    readOnly?: string;
  }>();

  const isReadOnly = params.readOnly === '1';
  const currentWeek = computeCurrentWeek();
  const weekStart = params.weekStart ?? currentWeek.weekStart;
  const weekEnd = params.weekEnd ?? currentWeek.weekEnd;

  const [win, setWin] = useState('');
  const [challenge, setChallenge] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [newLocalUris, setNewLocalUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ['weekly-review', user?.id, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', user!.id)
        .eq('week_start', weekStart)
        .maybeSingle();
      if (error) return { data: null, error };
      return { data, error: null };
    },
    enabled: !!user && !!weekStart,
    select: (res) => res.data,
  });

  useEffect(() => {
    if (existing) {
      setWin(existing.win ?? '');
      setChallenge(existing.challenge ?? '');
      setNextWeek(existing.next_week ?? '');
      setExistingPhotoUrls(existing.photo_urls ?? []);
    }
  }, [existing]);

  const handlePickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setNewLocalUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewLocalUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let newPublicUrls: string[] = [];
    for (let i = 0; i < newLocalUris.length; i++) {
      const { data: url, error } = await uploadWeeklyPhoto(
        user.id,
        newLocalUris[i]!,
        weekStart,
        existingPhotoUrls.length + i,
      );
      if (error) {
        Alert.alert('Upload Failed', error.message);
        setSaving(false);
        return;
      }
      if (url) newPublicUrls.push(url);
    }

    const allPhotoUrls = [...existingPhotoUrls, ...newPublicUrls];

    const { error: upsertError } = await supabase.from('weekly_reviews').upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        week_end: weekEnd,
        win,
        challenge,
        next_week: nextWeek,
        photo_urls: allPhotoUrls,
      },
      { onConflict: 'user_id,week_start' },
    );

    setSaving(false);
    if (upsertError) {
      Alert.alert('Save Failed', upsertError.message);
      return;
    }

    qc.invalidateQueries({ queryKey: ['weekly-reviews', user.id] });
    qc.invalidateQueries({ queryKey: ['weekly-review', user.id, weekStart] });
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.dragHandle} />
      <Eyebrow label="WEEKLY REVIEW" />

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

      {/* Photo strip */}
      {(existingPhotoUrls.length > 0 || newLocalUris.length > 0 || !isReadOnly) && (
        <View style={styles.photoSection}>
          <Eyebrow label="PICTURES OF THE WEEK" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
            contentContainerStyle={styles.photoRow}
          >
            {existingPhotoUrls.map((url, i) => (
              <Image key={`existing-${i}`} source={{ uri: url }} style={styles.photoThumb} />
            ))}
            {newLocalUris.map((uri, i) => (
              <View key={`new-${i}`} style={styles.newPhotoWrap}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeNewPhoto(i)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {!isReadOnly && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickPhotos}>
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
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveText}>{saving ? 'SAVING...' : 'SAVE'}</Text>
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
  photoScroll: { marginTop: 10 },
  photoRow: { gap: 8 },
  photoThumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 6,
    backgroundColor: colors.high,
  },
  newPhotoWrap: { position: 'relative' },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    color: colors.textPrimary,
    lineHeight: 13,
  },
  addPhotoBtn: {
    width: THUMB,
    height: THUMB,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoPlus: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.textTertiary,
    lineHeight: 22,
  },
  addPhotoText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textTertiary,
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
  closeText: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
});
