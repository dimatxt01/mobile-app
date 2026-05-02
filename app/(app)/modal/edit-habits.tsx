import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';
import type { Habit, HabitType } from '@/types/database';

type EditableHabit = { id?: string; label: string; points: number };

export default function EditHabitsScreen() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const habitType = (type ?? 'identity') as HabitType;
  const { user } = useAuth();
  const qc = useQueryClient();
  const [habits, setHabits] = useState<EditableHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', habitType)
      .order('sort_order')
      .then(({ data }) => {
        setHabits(
          (data as Habit[] | null)?.map((h) => ({ id: h.id, label: h.label, points: h.points })) ??
            [],
        );
        setLoading(false);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    const { error: deleteError } = await supabase
      .from('habits')
      .delete()
      .eq('user_id', user.id)
      .eq('type', habitType);
    if (deleteError) {
      setSaveError('Failed to save. Your habits are unchanged.');
      setSaving(false);
      return;
    }

    const rows = habits
      .filter((h) => h.label.trim())
      .map((h, i) => ({
        user_id: user.id,
        type: habitType,
        label: h.label.trim(),
        points: h.points,
        sort_order: i,
        enabled: true,
      }));
    if (rows.length) {
      const { error: insertError } = await supabase.from('habits').insert(rows);
      if (insertError) {
        setSaveError('Habits deleted but re-save failed. Please try again immediately.');
        setSaving(false);
        return;
      }
    }

    qc.invalidateQueries({ queryKey: ['config'] });
    setSaving(false);
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
    >
      <Eyebrow label={`${habitType.toUpperCase()} HABITS`} />
      <FlatList
        data={habits}
        keyExtractor={(_, i) => String(i)}
        style={{ marginTop: 12 }}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={item.label}
              onChangeText={(t) => {
                const copy = [...habits];
                copy[index] = { ...copy[index], label: t };
                setHabits(copy);
              }}
              placeholderTextColor={colors.textTertiary}
            />
            <TextInput
              style={[styles.input, styles.ptsInput]}
              value={String(item.points)}
              onChangeText={(t) => {
                const copy = [...habits];
                copy[index] = { ...copy[index], points: parseInt(t, 10) || 0 };
                setHabits(copy);
              }}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={() => setHabits(habits.filter((_, j) => j !== index))}>
              <Text style={styles.removeBtn}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity onPress={() => setHabits([...habits, { label: '', points: 5 }])}>
        <Text style={styles.addBtn}>+ ADD HABIT</Text>
      </TouchableOpacity>
      {saveError && <Text style={styles.errorText}>{saveError}</Text>}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'SAVING...' : 'SAVE'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>CANCEL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.elevated, paddingHorizontal: spacing.pagePad },
  centered: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  input: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.high,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
  },
  ptsInput: { width: 56, textAlign: 'center' },
  removeBtn: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.danger,
    paddingHorizontal: 8,
  },
  addBtn: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.amber,
    letterSpacing: 1.5,
    marginTop: 8,
    paddingVertical: 8,
  },
  saveBtn: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: { fontFamily: fonts.monoBold, fontSize: 14, letterSpacing: 1, color: colors.base },
  cancelBtn: { alignItems: 'center', marginTop: 16 },
  cancelText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  errorText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.danger,
    marginTop: 8,
    textAlign: 'center',
  },
});
