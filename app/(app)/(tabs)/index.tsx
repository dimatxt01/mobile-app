import { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { useConfig } from '@/features/habits/use-config';
import { useCheckin } from '@/features/checkin/use-checkin';
import { useSaveCheckin } from '@/features/checkin/save-checkin';
import { useLockCheckin } from '@/features/checkin/lock-checkin';
import { useHistory } from '@/features/history/use-history';
import { computeScore } from '@/lib/score';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { scale, radius } from '@/lib/hmc-tokens';
import { PrintBar } from '@/components/hmc/PrintBar';
import { BracketBlock } from '@/components/hmc/BracketBlock';
import { HabitRow } from '@/components/hmc/HabitRow';
import { Step05 } from '@/components/hmc/Step05';
import { Slider10 } from '@/components/hmc/Slider10';
import { BigNum } from '@/components/hmc/BigNum';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';
import { BottomBar } from '@/components/hmc/BottomBar';
export default function TodayScreen() {
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const config = useConfig();
  const { data: checkin } = useCheckin();
  const { save, cancel } = useSaveCheckin();
  const lockCheckin = useLockCheckin();
  const { data: history } = useHistory(14);

  const [identityChecks, setIdentityChecks] = useState<Record<string, boolean>>({});
  const [executionChecks, setExecutionChecks] = useState<Record<string, boolean>>({});
  const [perf9to5, setPerf9to5] = useState(0);
  const [outcomeScores, setOutcomeScores] = useState<Record<string, number>>({});
  const [penaltyScores, setPenaltyScores] = useState<Record<string, number>>({});
  const [reflectionWin, setReflectionWin] = useState('');
  const [reflectionBroke, setReflectionBroke] = useState('');
  const [reflectionTomorrow, setReflectionTomorrow] = useState('');

  useEffect(() => {
    if (!checkin) return;
    setIdentityChecks((checkin.identity_checks as Record<string, boolean>) ?? {});
    setExecutionChecks((checkin.execution_checks as Record<string, boolean>) ?? {});
    setPerf9to5(checkin.perf_9to5 ?? 0);
    setOutcomeScores((checkin.outcome_scores as Record<string, number>) ?? {});
    setPenaltyScores((checkin.penalty_scores as Record<string, number>) ?? {});
    setReflectionWin(checkin.reflection_win ?? '');
    setReflectionBroke(checkin.reflection_broke ?? '');
    setReflectionTomorrow(checkin.reflection_tomorrow ?? '');
  }, [checkin?.id]);

  const isLate = useMemo(() => {
    if (!profile?.reminder_time) return false;
    const parts = profile.reminder_time.split(':').map(Number);
    const rh = parts[0] ?? 0;
    const rm = parts[1] ?? 0;
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const minutesReminder = rh * 60 + rm;
    return minutesNow > minutesReminder + 30;
  }, [profile?.reminder_time]);

  const score = config.data
    ? computeScore(
        config.data.identityHabits,
        config.data.executionHabits,
        config.data.outcomes,
        config.data.penalties,
        {
          identityChecks,
          executionChecks,
          perf9to5,
          outcomeScores,
          penaltyScores,
          whoopScoreAdj: checkin?.whoop_score_adj ?? 0,
          isLate,
        },
      )
    : null;

  const prevDayRow = useMemo(() => {
    if (!history) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    return history.find((r) => r.date < todayStr) ?? null;
  }, [history]);

  const delta = prevDayRow != null && score != null ? score.total - prevDayRow.total_score : null;

  useEffect(() => {
    if (!config.data) return;
    save({
      identity_checks: identityChecks,
      execution_checks: executionChecks,
      perf_9to5: perf9to5,
      outcome_scores: outcomeScores,
      penalty_scores: penaltyScores,
      reflection_win: reflectionWin || null,
      reflection_broke: reflectionBroke || null,
      reflection_tomorrow: reflectionTomorrow || null,
    });
  }, [
    identityChecks,
    executionChecks,
    perf9to5,
    outcomeScores,
    penaltyScores,
    reflectionWin,
    reflectionBroke,
    reflectionTomorrow,
  ]);

  useEffect(() => {
    if (!checkin?.is_locked || !score) return;
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isLastDay =
      new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === now.getDate();
    router.push({
      pathname: '/(app)/modal/day-complete',
      params: {
        score: (checkin.total_score ?? score.total).toString(),
        identityScore: score.identity.toString(),
        executionScore: score.execution.toString(),
        outcomeScore: score.outcome.toString(),
        penaltyScore: score.penalty.toString(),
        isSunday: isSunday ? '1' : '0',
        isLastDay: isLastDay ? '1' : '0',
        checkinId: checkin.id,
      },
    });
    // fire only on lock transition; score/checkin values are current at the point of firing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkin?.is_locked]);

  useEffect(() => {
    if (!history || !history.length || checkin?.is_locked) return;
    const lastDate = history[0]?.date;
    if (!lastDate) return;
    const daysDiff = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
    if (daysDiff > 2) router.push('/(app)/modal/returning-user');
  }, [history]);

  useEffect(() => {
    if (lockCheckin.isError)
      Alert.alert('Lock Failed', "Could not lock today's check-in. Please try again.");
  }, [lockCheckin.isError]);

  const handleLock = () => {
    if (!checkin || !score) return;
    cancel();
    lockCheckin.mutate({
      checkinId: checkin.id,
      identityScore: score.identity,
      executionScore: score.execution,
      outcomeScore: score.outcome,
      penaltyScore: score.penalty,
    });
  };

  const isLocked = !!checkin?.is_locked;

  return (
    <View style={styles.container}>
      {isLate && (
        <View style={styles.lateBanner}>
          <Text style={styles.lateText}>LATE CHECK-IN · −10 PTS</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 0 }}>
        <PrintBar dayNumber={(profile?.day_count ?? 0) + 1} />

        {/* Yesterday's letter */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const yesterdayCheckin = history?.find((r) => r.date !== today);
          const letter = (yesterdayCheckin as { reflection_tomorrow?: string } | undefined)
            ?.reflection_tomorrow;
          if (!letter || isLocked) return null;
          return (
            <View style={styles.letterCard}>
              <Text style={styles.letterCardEyebrow}>✉ A LETTER FROM YESTERDAY-YOU</Text>
              <Text style={styles.letterCardText}>{letter}</Text>
            </View>
          );
        })()}

        {profile?.identity_sentence && (
          <View style={styles.sentence}>
            <Eyebrow label="TODAY, I AM" />
            <Text style={styles.sentenceText}>{profile.identity_sentence}</Text>
          </View>
        )}

        <View style={styles.brackets}>
          <BracketBlock title="IDENTITY" subtotal={score?.identity ?? 0}>
            {config.data?.identityHabits.map((h) => (
              <HabitRow
                key={h.id}
                label={h.label}
                points={h.points}
                checked={identityChecks[h.id] ?? false}
                onToggle={() => setIdentityChecks((prev) => ({ ...prev, [h.id]: !prev[h.id] }))}
                disabled={isLocked}
              />
            ))}
          </BracketBlock>
          <BracketBlock title="EXECUTION" subtotal={score?.execution ?? 0}>
            {config.data?.executionHabits.map((h) => (
              <HabitRow
                key={h.id}
                label={h.label}
                points={h.points}
                checked={executionChecks[h.id] ?? false}
                onToggle={() => setExecutionChecks((prev) => ({ ...prev, [h.id]: !prev[h.id] }))}
                disabled={isLocked}
              />
            ))}
            <Slider10 value={perf9to5} onChange={setPerf9to5} disabled={isLocked} />
          </BracketBlock>
          <BracketBlock title="OUTCOMES" subtotal={score?.outcome ?? 0}>
            {config.data?.outcomes.map((m) => (
              <Step05
                key={m.id}
                label={m.label}
                value={outcomeScores[m.id] ?? 0}
                onChange={(v) => setOutcomeScores((prev) => ({ ...prev, [m.id]: v }))}
                disabled={isLocked}
              />
            ))}
          </BracketBlock>
          <BracketBlock title="PENALTY" subtotal={score?.penalty ?? 0} danger>
            {config.data?.penalties.map((p) => (
              <Step05
                key={p.id}
                label={p.label}
                value={penaltyScores[p.id] ?? 0}
                onChange={(v) => setPenaltyScores((prev) => ({ ...prev, [p.id]: v }))}
                danger
                disabled={isLocked}
              />
            ))}
          </BracketBlock>
        </View>

        {/* Reflection */}
        <View style={styles.reflectionSection}>
          <Eyebrow label="REFLECTION" />
          <View style={styles.reflRow}>
            <Text style={styles.reflLabel}>WIN TODAY</Text>
            <TextInput
              style={[styles.reflInput, isLocked && styles.reflInputDisabled]}
              value={reflectionWin}
              onChangeText={setReflectionWin}
              placeholder="What did you do right?"
              placeholderTextColor={colors.textTertiary}
              multiline
              editable={!isLocked}
            />
          </View>
          <Rule />
          <View style={styles.reflRow}>
            <Text style={styles.reflLabel}>BROKE MY WORD</Text>
            <TextInput
              style={[styles.reflInput, isLocked && styles.reflInputDisabled]}
              value={reflectionBroke}
              onChangeText={setReflectionBroke}
              placeholder="Where did you fall short?"
              placeholderTextColor={colors.textTertiary}
              multiline
              editable={!isLocked}
            />
          </View>
          <Rule />
          <View style={styles.reflRow}>
            <Text style={styles.reflLabel}>{"TOMORROW'S NON-NEGOTIABLE"}</Text>
            <TextInput
              style={[styles.reflInput, isLocked && styles.reflInputDisabled]}
              value={reflectionTomorrow}
              onChangeText={setReflectionTomorrow}
              placeholder="The one thing that must happen."
              placeholderTextColor={colors.textTertiary}
              multiline
              editable={!isLocked}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.totalSection}
          onPress={() =>
            router.push({
              pathname: '/(app)/modal/score-breakdown',
              params: {
                identity: String(score?.identity ?? 0),
                execution: String(score?.execution ?? 0),
                outcome: String(score?.outcome ?? 0),
                penalty: String(score?.penalty ?? 0),
                total: String(score?.total ?? 0),
              },
            })
          }
        >
          <Eyebrow label="TOTAL SCORE" />
          <BigNum value={score?.total ?? 0} highlight={isLocked} />
          {delta !== null && (
            <Text style={[styles.delta, delta > 0 ? styles.deltaPositive : styles.deltaNegative]}>
              {delta > 0 ? `+${delta}` : `${delta}`} VS YESTERDAY
            </Text>
          )}
          <Text style={styles.hint}>TAP FOR BREAKDOWN</Text>
        </TouchableOpacity>
      </ScrollView>
      {!isLocked ? (
        <BottomBar
          label={`LOCK IN · ${score?.total ?? 0} PTS`}
          onPress={handleLock}
          loading={lockCheckin.isPending}
          disabled={!checkin || !score}
        />
      ) : (
        <View style={styles.lockedBar}>
          <Text style={styles.lockedText}>LOCKED · {checkin.total_score} PTS</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  lateBanner: {
    backgroundColor: colors.danger,
    paddingVertical: 6,
    alignItems: 'center',
  },
  lateText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textPrimary,
  },
  brackets: {
    paddingHorizontal: spacing.pagePad,
    paddingTop: 20,
    gap: scale.xl2,
  },
  letterCard: {
    marginHorizontal: spacing.pagePad,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.amber,
    gap: 6,
  },
  letterCardEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.8,
    color: colors.amber,
  },
  letterCardText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sentence: {
    paddingHorizontal: spacing.pagePad,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  sentenceText: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
    lineHeight: 32,
    letterSpacing: -0.4,
    marginTop: 8,
  },
  reflectionSection: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 20,
  },
  reflRow: {
    paddingVertical: 14,
  },
  reflLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginBottom: 12,
  },
  reflInput: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textPrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineStrong,
    paddingBottom: 8,
    minHeight: 36,
  },
  reflInputDisabled: {
    color: colors.textSecondary,
  },
  totalSection: {
    marginHorizontal: spacing.pagePad,
    marginTop: scale.xl3,
    paddingHorizontal: 16,
    paddingVertical: spacing.sectionGap,
    backgroundColor: colors.surface02,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginTop: 4,
  },
  delta: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  deltaPositive: { color: colors.amber },
  deltaNegative: { color: colors.danger },
  lockedBar: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineStrong,
    backgroundColor: colors.base,
  },
  lockedText: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: colors.amber,
  },
});
