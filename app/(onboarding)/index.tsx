import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { scheduleReminder } from '@/features/notifications/schedule-reminder';
import { colors, fonts, spacing, radius, scale } from '@/lib/habits-colors';
import { POBar } from '@/components/habits/POBar';
import { POCta } from '@/components/habits/POCta';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';
import { Input } from '@/components/ui/Input';

const DEFAULT_IDENTITY_HABITS = [
  { label: 'Wake On Time', points: 5 },
  { label: 'Visualization', points: 5 },
  { label: 'No BS Discipline', points: 5 },
  { label: 'Kept My Word', points: 5 },
];
const DEFAULT_EXECUTION_HABITS = [
  { label: 'Deep Work AM', points: 15 },
  { label: 'Evening Work', points: 10 },
  { label: 'Gym', points: 10 },
  { label: 'Learning', points: 5 },
  { label: 'Sales / Outreach', points: 5 },
  { label: 'Content / Brand', points: 5 },
  { label: 'Public Speaking', points: 5 },
];
const DEFAULT_OUTCOMES = [
  'Revenue / Deals',
  'Authority / Content',
  'Relationships',
  'Mission Progress',
];
const DEFAULT_PENALTIES = ['Alcohol', 'Nicotine', 'Wasted Time'];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { profile, setProfile } = useProfileStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(session?.user?.user_metadata?.full_name ?? '');
  const [vision, setVision] = useState('');
  const [identitySentence, setIdentitySentence] = useState('');
  const [identityHabits, setIdentityHabits] = useState(DEFAULT_IDENTITY_HABITS);
  const [executionHabits, setExecutionHabits] = useState(DEFAULT_EXECUTION_HABITS);
  const [outcomes, setOutcomes] = useState(DEFAULT_OUTCOMES);
  const [penalties, setPenalties] = useState(DEFAULT_PENALTIES);
  const [reminderHour, setReminderHour] = useState(21);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [dobMonth, setDobMonth] = useState(1);
  const [dobDay, setDobDay] = useState(1);
  const [dobYear, setDobYear] = useState(1990);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reminderTime = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;
  // day 0 rolls back to last day of preceding month
  const dobMaxDay = new Date(dobYear, dobMonth, 0).getDate();
  const dobDayClamped = Math.min(dobDay, dobMaxDay);
  const dob = `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDayClamped).padStart(2, '0')}`;

  useEffect(() => {
    if (step !== 14) return;
    (async () => {
      setIsSaving(true);
      setSaveError(null);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          identity_sentence: identitySentence,
          vision,
          reminder_time: reminderTime,
          date_of_birth: dob,
          onboarding_completed: true,
        })
        .eq('id', session!.user.id);

      if (profileError) {
        setIsSaving(false);
        setSaveError('Could not save your profile. Check your connection and try again.');
        setStep(13);
        return;
      }

      const { error: habitsError } = await supabase.rpc('seed_default_habits', {
        p_user_id: session!.user.id,
      });

      if (habitsError) {
        setIsSaving(false);
        setSaveError('Could not seed habits. Check your connection and try again.');
        setStep(13);
        return;
      }

      await scheduleReminder(reminderTime).catch((e) =>
        console.warn('[onboarding] scheduleReminder failed', e),
      );

      setProfile({ ...profile!, onboarding_completed: true, date_of_birth: dob });
      router.replace('/(app)/(tabs)');
    })();
  }, [step]);

  const canNext = () => {
    switch (step) {
      case 2:
        return name.trim().length > 0;
      case 3: {
        const testDate = new Date(dob);
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        return !isNaN(testDate.getTime()) && testDate < oneYearAgo;
      }
      case 4:
        return vision.trim().length > 0;
      case 5:
        return identitySentence.trim().length > 0;
      case 6:
        return identityHabits.length > 0;
      case 7:
        return executionHabits.length > 0;
      case 9:
        return outcomes.length > 0;
      case 10:
        return penalties.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.centered}>
            <Text style={styles.bigLogo}>HABITS.</Text>
            <Text style={styles.tagline}>{'Score your day.\nBuild your legend.'}</Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="YOUR NAME" size="md" />
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              autoComplete="name"
              autoFocus
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="DATE OF BIRTH" size="md" />
            <Text style={styles.explainer}>Used for your Life in Weeks visualization.</Text>
            <View style={styles.timeRow}>
              <View style={styles.timePicker}>
                <TouchableOpacity onPress={() => setDobMonth((m) => (m === 12 ? 1 : m + 1))}>
                  <Text style={styles.timeBtn}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeVal}>
                  {
                    [
                      'JAN',
                      'FEB',
                      'MAR',
                      'APR',
                      'MAY',
                      'JUN',
                      'JUL',
                      'AUG',
                      'SEP',
                      'OCT',
                      'NOV',
                      'DEC',
                    ][dobMonth - 1]
                  }
                </Text>
                <TouchableOpacity onPress={() => setDobMonth((m) => (m === 1 ? 12 : m - 1))}>
                  <Text style={styles.timeBtn}>▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timePicker}>
                <TouchableOpacity onPress={() => setDobDay((d) => (d === dobMaxDay ? 1 : d + 1))}>
                  <Text style={styles.timeBtn}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeVal}>{String(dobDayClamped).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => setDobDay((d) => (d === 1 ? dobMaxDay : d - 1))}>
                  <Text style={styles.timeBtn}>▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timePicker}>
                <TouchableOpacity
                  onPress={() => setDobYear((y) => Math.min(y + 1, new Date().getFullYear() - 1))}
                >
                  <Text style={styles.timeBtn}>▲</Text>
                </TouchableOpacity>
                <Text style={[styles.timeVal, styles.yearVal]}>{dobYear}</Text>
                <TouchableOpacity onPress={() => setDobYear((y) => Math.max(y - 1, 1930))}>
                  <Text style={styles.timeBtn}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="YOUR VISION" size="md" />
            <Input
              value={vision}
              onChangeText={setVision}
              placeholder="What are you building toward?"
              multiline
              style={styles.multiline}
              autoFocus
            />
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="I AM" size="md" />
            <View style={styles.prefixRow}>
              <Text style={styles.prefix}>I am </Text>
              <View style={styles.prefixInput}>
                <Input
                  value={identitySentence}
                  onChangeText={setIdentitySentence}
                  placeholder="a disciplined builder..."
                  autoFocus
                />
              </View>
            </View>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="IDENTITY HABITS" size="md" />
            <Rule />
            {identityHabits.map((h, i) => (
              <View key={i} style={styles.habitEditRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={h.label}
                  onChangeText={(t) => {
                    const copy = [...identityHabits];
                    copy[i] = { ...copy[i], label: t };
                    setIdentityHabits(copy);
                  }}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                />
                <Text style={styles.pts}>+{h.points}</Text>
                <TouchableOpacity
                  onPress={() => setIdentityHabits(identityHabits.filter((_, j) => j !== i))}
                >
                  <Text style={styles.removeBtn}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {identityHabits.length < 6 && (
              <TouchableOpacity
                onPress={() => setIdentityHabits([...identityHabits, { label: '', points: 5 }])}
              >
                <Text style={styles.addBtn}>+ ADD HABIT</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case 7:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="EXECUTION HABITS" size="md" />
            <Rule />
            {executionHabits.map((h, i) => (
              <View key={i} style={styles.habitEditRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={h.label}
                  onChangeText={(t) => {
                    const copy = [...executionHabits];
                    copy[i] = { ...copy[i], label: t };
                    setExecutionHabits(copy);
                  }}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                />
                <Text style={styles.pts}>+{h.points}</Text>
                <TouchableOpacity
                  onPress={() => setExecutionHabits(executionHabits.filter((_, j) => j !== i))}
                >
                  <Text style={styles.removeBtn}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {executionHabits.length < 10 && (
              <TouchableOpacity
                onPress={() => setExecutionHabits([...executionHabits, { label: '', points: 5 }])}
              >
                <Text style={styles.addBtn}>+ ADD HABIT</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case 8:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="9-TO-5 SCORE" size="md" />
            <Text style={styles.explainer}>
              Each night you rate your work day 0–10. This score gets added to your Execution
              bracket.
              {'\n\n'}0 = didn{"'"}t show up{'\n'}5 = average day{'\n'}10 = absolute peak
              performance
            </Text>
          </View>
        );
      case 9:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="OUTCOMES (0–5 NIGHTLY)" size="md" />
            <Rule />
            {outcomes.map((o, i) => (
              <View key={i} style={styles.habitEditRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={o}
                  onChangeText={(t) => {
                    const copy = [...outcomes];
                    copy[i] = t;
                    setOutcomes(copy);
                  }}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setOutcomes(outcomes.filter((_, j) => j !== i))}>
                  <Text style={styles.removeBtn}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {outcomes.length < 5 && (
              <TouchableOpacity onPress={() => setOutcomes([...outcomes, ''])}>
                <Text style={styles.addBtn}>+ ADD OUTCOME</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case 10:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="PENALTIES (0–5, SUBTRACTED)" size="md" />
            <Rule />
            {penalties.map((p, i) => (
              <View key={i} style={styles.habitEditRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={p}
                  onChangeText={(t) => {
                    const copy = [...penalties];
                    copy[i] = t;
                    setPenalties(copy);
                  }}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setPenalties(penalties.filter((_, j) => j !== i))}>
                  <Text style={styles.removeBtn}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {penalties.length < 5 && (
              <TouchableOpacity onPress={() => setPenalties([...penalties, ''])}>
                <Text style={styles.addBtn}>+ ADD PENALTY</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case 11:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="WHOOP INTEGRATION" size="md" />
            <Text style={styles.explainer}>
              Coming soon. Whoop recovery and strain data will automatically adjust your daily
              score.
            </Text>
          </View>
        );
      case 12:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="DAILY REMINDER" size="md" />
            <View style={styles.timeRow}>
              <View style={styles.timePicker}>
                <TouchableOpacity onPress={() => setReminderHour((h) => (h + 1) % 24)}>
                  <Text style={styles.timeBtn}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeVal}>{String(reminderHour).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => setReminderHour((h) => (h - 1 + 24) % 24)}>
                  <Text style={styles.timeBtn}>▼</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.timeSep}>:</Text>
              <View style={styles.timePicker}>
                <TouchableOpacity onPress={() => setReminderMinute((m) => (m + 15) % 60)}>
                  <Text style={styles.timeBtn}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeVal}>{String(reminderMinute).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => setReminderMinute((m) => (m - 15 + 60) % 60)}>
                  <Text style={styles.timeBtn}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 13:
        return (
          <View style={styles.stepContent}>
            <Eyebrow label="YOUR CONFIG" size="md" />
            {saveError && <Text style={styles.errorText}>{saveError}</Text>}
            <Rule />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>NAME</Text>
              <Text style={styles.summaryValue}>{name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>BIRTH DATE</Text>
              <Text style={styles.summaryValue}>{dob}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VISION</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {vision}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>I AM</Text>
              <Text style={styles.summaryValue}>{identitySentence}</Text>
            </View>
            <Rule />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IDENTITY</Text>
              <Text style={styles.summaryValue}>{identityHabits.length} habits</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>EXECUTION</Text>
              <Text style={styles.summaryValue}>{executionHabits.length} habits</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>OUTCOMES</Text>
              <Text style={styles.summaryValue}>{outcomes.length} metrics</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>PENALTIES</Text>
              <Text style={styles.summaryValue}>{penalties.length} items</Text>
            </View>
            <Rule />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>REMINDER</Text>
              <Text style={styles.summaryValue}>{reminderTime}</Text>
            </View>
          </View>
        );
      case 14:
        return (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.amber} />
            <Text style={[styles.explainer, { marginTop: 16 }]}>Setting up Habits...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const ctaLabel = () => {
    switch (step) {
      case 1:
        return 'BEGIN';
      case 6:
      case 7:
        return 'LOOKS GOOD';
      case 8:
        return 'GOT IT';
      case 9:
      case 10:
        return 'DONE';
      case 11:
        return 'SKIP FOR NOW';
      case 12:
        return 'SET REMINDER';
      case 13:
        return 'LOCK IN MY CONFIG';
      default:
        return 'NEXT';
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {step < 14 && <POBar step={step} total={14} />}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>
      {step < 14 && (
        <View style={{ paddingBottom: insets.bottom + 16 }}>
          <POCta label={ctaLabel()} onPress={() => setStep(step + 1)} disabled={!canNext()} />
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.backText}>BACK</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.pagePad },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigLogo: {
    fontFamily: fonts.monoBold,
    fontSize: 80,
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  tagline: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 32,
  },
  stepContent: { flex: 1, paddingTop: scale.xl3 },
  input: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.elevated,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  prefixRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  prefix: { fontFamily: fonts.display, fontSize: 16, color: colors.textSecondary, marginRight: 4 },
  prefixInput: { flex: 1 },
  explainer: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 24,
  },
  habitEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  pts: { fontFamily: fonts.mono, fontSize: 13, color: colors.amber, fontVariant: ['tabular-nums'] },
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
    marginTop: 16,
    paddingVertical: 8,
  },
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
    fontSize: 40,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  yearVal: { fontSize: 28, letterSpacing: 0 },
  timeSep: { fontFamily: fonts.monoBold, fontSize: 40, color: colors.textTertiary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  summaryLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  summaryValue: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  backBtn: { alignItems: 'center', marginTop: 20 },
  backText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  errorText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.danger,
    marginBottom: 12,
    lineHeight: 20,
  },
});
