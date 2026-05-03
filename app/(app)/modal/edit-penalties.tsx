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
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import type { PenaltyItem } from '@/types/database';

type EditablePenalty = { id?: string; label: string };

export default function EditPenaltiesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [items, setItems] = useState<EditablePenalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('penalty_items')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order')
      .then(({ data }) => {
        setItems((data as PenaltyItem[] | null)?.map((p) => ({ id: p.id, label: p.label })) ?? []);
        setLoading(false);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    const { error: deleteError } = await supabase
      .from('penalty_items')
      .delete()
      .eq('user_id', user.id);
    if (deleteError) {
      setSaveError('Failed to save. Your penalties are unchanged.');
      setSaving(false);
      return;
    }

    const rows = items
      .filter((i) => i.label.trim())
      .map((i, idx) => ({ user_id: user.id, label: i.label.trim(), sort_order: idx }));
    if (rows.length) {
      const { error: insertError } = await supabase.from('penalty_items').insert(rows);
      if (insertError) {
        setSaveError('Penalties deleted but re-save failed. Please try again immediately.');
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
      <View style={styles.dragHandle} />
      <Eyebrow label="PENALTIES" />
      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        style={{ marginTop: 12 }}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={item.label}
              onChangeText={(t) => {
                const copy = [...items];
                copy[index] = { ...copy[index], label: t };
                setItems(copy);
              }}
              placeholderTextColor={colors.textTertiary}
            />
            <TouchableOpacity onPress={() => setItems(items.filter((_, j) => j !== index))}>
              <Text style={styles.removeBtn}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {items.length < 5 && (
        <TouchableOpacity onPress={() => setItems([...items, { label: '' }])}>
          <Text style={styles.addBtn}>+ ADD PENALTY</Text>
        </TouchableOpacity>
      )}
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
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderDefault,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  centered: { alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  input: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.high,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
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
    borderRadius: radius.md,
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
