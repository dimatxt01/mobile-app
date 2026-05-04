import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius, scale } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/hmc/Eyebrow';

export default function MonthlyReviewScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [reflection, setReflection] = useState('');
  const [verdict, setVerdict] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const now = new Date();
    await supabase.from('monthly_reviews').upsert(
      {
        user_id: user.id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        reflection,
        verdict,
      },
      { onConflict: 'user_id,year,month' },
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
      <Eyebrow label="MONTHLY REVIEW" />
      <View style={styles.card}>
        <Text style={styles.label}>Month reflection</Text>
        <TextInput
          style={styles.input}
          value={reflection}
          onChangeText={setReflection}
          multiline
          placeholderTextColor={colors.textTertiary}
          placeholder="How did this month go?"
        />
        <Text style={styles.label}>Verdict</Text>
        <TextInput
          style={styles.input}
          value={verdict}
          onChangeText={setVerdict}
          multiline
          placeholderTextColor={colors.textTertiary}
          placeholder="One-line verdict"
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
