import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius, scale } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';

export default function WeeklyReviewScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [win, setWin] = useState('');
  const [challenge, setChallenge] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    await supabase.from('weekly_reviews').upsert(
      {
        user_id: user.id,
        week_start: weekStart.toISOString().slice(0, 10),
        week_end: weekEnd.toISOString().slice(0, 10),
        win,
        challenge,
        next_week: nextWeek,
      },
      { onConflict: 'user_id,week_start' },
    );
    setSaving(false);
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
        <TextInput
          style={styles.input}
          value={win}
          onChangeText={setWin}
          multiline
          placeholderTextColor={colors.textTertiary}
          placeholder="What went well?"
        />
        <Text style={styles.label}>Biggest challenge</Text>
        <TextInput
          style={styles.input}
          value={challenge}
          onChangeText={setChallenge}
          multiline
          placeholderTextColor={colors.textTertiary}
          placeholder="What was hard?"
        />
        <Text style={styles.label}>Intention for next week</Text>
        <TextInput
          style={styles.input}
          value={nextWeek}
          onChangeText={setNextWeek}
          multiline
          placeholderTextColor={colors.textTertiary}
          placeholder="What will you focus on?"
        />
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'SAVING...' : 'SAVE'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>SKIP</Text>
      </TouchableOpacity>
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
});
