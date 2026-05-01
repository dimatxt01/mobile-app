import { useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { scheduleReminder } from '@/features/notifications/schedule-reminder';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile, setProfile } = useProfileStore();
  const parts = (profile?.reminder_time ?? '21:00').split(':').map(Number);
  const [hour, setHour] = useState(parts[0] ?? 21);
  const [minute, setMinute] = useState(parts[1] ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const newTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    await supabase.from('profiles').update({ reminder_time: newTime }).eq('id', user.id);
    try {
      await scheduleReminder(newTime);
    } catch (err) {
      Alert.alert('Could not schedule reminder', err instanceof Error ? err.message : String(err));
    }
    setProfile(profile ? { ...profile, reminder_time: newTime } : null);
    setSaving(false);
    router.back();
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
    >
      <Eyebrow label="DAILY REMINDER" />
      <View style={styles.timeRow}>
        <View style={styles.timePicker}>
          <TouchableOpacity onPress={() => setHour((h) => (h + 1) % 24)}>
            <Text style={styles.timeBtn}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.timeVal}>{String(hour).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={() => setHour((h) => (h - 1 + 24) % 24)}>
            <Text style={styles.timeBtn}>▼</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.timeSep}>:</Text>
        <View style={styles.timePicker}>
          <TouchableOpacity onPress={() => setMinute((m) => (m + 15) % 60)}>
            <Text style={styles.timeBtn}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.timeVal}>{String(minute).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={() => setMinute((m) => (m - 15 + 60) % 60)}>
            <Text style={styles.timeBtn}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
  },
  timePicker: { alignItems: 'center', gap: 8 },
  timeBtn: { fontFamily: fonts.mono, fontSize: 18, color: colors.amber, padding: 8 },
  timeVal: {
    fontFamily: fonts.monoBold,
    fontSize: 36,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timeSep: { fontFamily: fonts.monoBold, fontSize: 36, color: colors.textTertiary },
  saveBtn: {
    backgroundColor: colors.amber,
    borderRadius: 8,
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
