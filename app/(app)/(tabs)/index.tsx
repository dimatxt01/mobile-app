import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
import { PrintBar } from '@/components/hmc/PrintBar';
import { BracketBlock } from '@/components/hmc/BracketBlock';
import { HabitRow } from '@/components/hmc/HabitRow';
import { Step05 } from '@/components/hmc/Step05';
import { Slider10 } from '@/components/hmc/Slider10';
import { BigNum } from '@/components/hmc/BigNum';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';
import { BottomBar } from '@/components/hmc/BottomBar';
import { useScoreDensity } from '@/lib/score-density';

export default function TodayScreen() {
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const config = useConfig();
  const { data: checkin } = useCheckin();
  const { save, cancel } = useSaveCheckin();
  const lockCheckin = useLockCheckin();
  const { data: history } = useHistory(14);
  const [scoreDensity] = useScoreDensity();
  void scoreDensity; // rendering deferred to Sprint 2; keeps hook alive in render cycle

  const [identityChecks, setIdentityChecks] = useState<Record<string, boolean>>({});
  const [executionChecks, setExecutionChecks] = useState<Record<string, boolean>>({});
  const [perf9to5, setPerf9to5] = useState(0);
  const [outcomeScores, setOutcomeScores] = useState<Record<string, number>>({});
  const [penaltyScores, setPenaltyScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!checkin) return;
    setIdentityChecks((checkin.identity_checks as Record<string, boolean>) ?? {});
    setExecutionChecks((checkin.execution_checks as Record<string, boolean>) ?? {});
    setPerf9to5(checkin.perf_9to5 ?? 0);
    setOutcomeScores((checkin.outcome_scores as Record<string, number>) ?? {});
    setPenaltyScores((checkin.penalty_scores as Record<string, number>) ?? {});
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
    // relies on get_history() returning rows ORDER BY date DESC
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
    });
  }, [identityChecks, executionChecks, perf9to5, outcomeScores, penaltyScores]);

  useEffect(() => {
    if (!checkin?.is_locked) return;
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isLastDay =
      new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === now.getDate();
    if (isSunday) router.push('/(app)/modal/weekly-review');
    else if (isLastDay) router.push('/(app)/modal/monthly-review');
  }, [checkin?.is_locked]);

  useEffect(() => {
    if (!history || !history.length || checkin?.is_locked) return;
    const lastDate = history[0]?.date;
    if (!lastDate) return;
    const daysDiff = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
    if (daysDiff > 2) router.push('/(app)/modal/returning-user');
  }, [history]);

  const handleLock = () => {
    if (!checkin || !score) return;
    cancel(); // prevent stale debounce write to now-locked row
    lockCheckin.mutate({
      checkinId: checkin.id,
      identityScore: score.identity,
      executionScore: score.execution,
      outcomeScore: score.outcome,
      penaltyScore: score.penalty,
    });
  };

  return (
    <View style={styles.container}>
      {isLate && (
        <View style={styles.lateBanner}>
          <Text style={styles.lateText}>LATE CHECK-IN · −10 PTS</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <PrintBar dayNumber={(profile?.day_count ?? 0) + 1} />
        {profile?.identity_sentence && (
          <View style={styles.sentence}>
            <Eyebrow label="TODAY, I AM" />
            <Text style={styles.sentenceText}>{profile.identity_sentence}</Text>
          </View>
        )}
        <BracketBlock title="IDENTITY" subtotal={score?.identity ?? 0}>
          {config.data?.identityHabits.map((h) => (
            <HabitRow
              key={h.id}
              label={h.label}
              points={h.points}
              checked={identityChecks[h.id] ?? false}
              onToggle={() => setIdentityChecks((prev) => ({ ...prev, [h.id]: !prev[h.id] }))}
              disabled={checkin?.is_locked}
            />
          ))}
        </BracketBlock>
        <Rule />
        <BracketBlock title="EXECUTION" subtotal={score?.execution ?? 0}>
          {config.data?.executionHabits.map((h) => (
            <HabitRow
              key={h.id}
              label={h.label}
              points={h.points}
              checked={executionChecks[h.id] ?? false}
              onToggle={() => setExecutionChecks((prev) => ({ ...prev, [h.id]: !prev[h.id] }))}
              disabled={checkin?.is_locked}
            />
          ))}
          <Slider10 value={perf9to5} onChange={setPerf9to5} disabled={checkin?.is_locked} />
        </BracketBlock>
        <Rule />
        <BracketBlock title="OUTCOMES" subtotal={score?.outcome ?? 0}>
          {config.data?.outcomes.map((m) => (
            <Step05
              key={m.id}
              label={m.label}
              value={outcomeScores[m.id] ?? 0}
              onChange={(v) => setOutcomeScores((prev) => ({ ...prev, [m.id]: v }))}
              disabled={checkin?.is_locked}
            />
          ))}
        </BracketBlock>
        <Rule />
        <BracketBlock title="PENALTY" subtotal={score?.penalty ?? 0} danger>
          {config.data?.penalties.map((p) => (
            <Step05
              key={p.id}
              label={p.label}
              value={penaltyScores[p.id] ?? 0}
              onChange={(v) => setPenaltyScores((prev) => ({ ...prev, [p.id]: v }))}
              danger
              disabled={checkin?.is_locked}
            />
          ))}
        </BracketBlock>
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
          <Eyebrow label="TOTAL" />
          <BigNum value={score?.total ?? 0} highlight={checkin?.is_locked} />
          {delta !== null && (
            <Text style={[styles.delta, delta > 0 ? styles.deltaPositive : styles.deltaNegative]}>
              {delta > 0 ? `+${delta}` : `${delta}`} VS YESTERDAY
            </Text>
          )}
          <Text style={styles.hint}>TAP FOR BREAKDOWN</Text>
        </TouchableOpacity>
      </ScrollView>
      {!checkin?.is_locked ? (
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
  sentence: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 12,
  },
  sentenceText: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: spacing.sectionGap,
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
