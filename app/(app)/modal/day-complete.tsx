import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';

export default function DayCompleteScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    score: string;
    identityScore: string;
    executionScore: string;
    outcomeScore: string;
    penaltyScore: string;
    isSunday: string;
    isLastDay: string;
    checkinId: string;
  }>();

  const score = parseInt(params.score ?? '0', 10);
  const isSunday = params.isSunday === '1';
  const isLastDay = params.isLastDay === '1';
  const checkinId = params.checkinId ?? '';

  const [letterOpen, setLetterOpen] = useState(false);
  const [letter, setLetter] = useState('');
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);

  const brackets = [
    { label: 'IDENTITY', value: parseInt(params.identityScore ?? '0', 10) },
    { label: 'EXECUTION', value: parseInt(params.executionScore ?? '0', 10) },
    { label: 'OUTCOMES', value: parseInt(params.outcomeScore ?? '0', 10) },
    { label: 'PENALTY', value: parseInt(params.penaltyScore ?? '0', 10), danger: true },
  ];

  const handleSealLetter = async () => {
    if (!letter.trim() || !checkinId || sealing) return;
    setSealing(true);
    await supabase
      .from('daily_checkins')
      .update({ reflection_tomorrow: letter.trim() })
      .eq('id', checkinId);
    setSealing(false);
    setSealed(true);
  };

  const handleDone = () => {
    router.back();
  };

  const handleWeeklyReview = () => {
    router.replace('/(app)/modal/weekly-review');
  };

  const handleMonthlyReview = () => {
    router.replace('/(app)/modal/monthly-review');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top + 20 }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.dragHandle} />

        {/* Score receipt */}
        <View style={styles.scoreBlock}>
          <Eyebrow label="DAY SEALED" />
          <Text style={styles.scoreNum}>{score}</Text>
          <Text style={styles.scorePts}>PTS</Text>
        </View>

        <Rule strong />

        {/* Bracket breakdown */}
        <View style={styles.section}>
          <Eyebrow label="BREAKDOWN" />
          {brackets.map((b) => (
            <View key={b.label} style={styles.bracketRow}>
              <Text style={styles.bracketLabel}>{b.label}</Text>
              <Text style={[styles.bracketVal, b.danger && styles.bracketDanger]}>
                {b.danger ? `−${b.value}` : `+${b.value}`}
              </Text>
            </View>
          ))}
          <View style={[styles.bracketRow, styles.bracketTotal]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalVal}>{score}</Text>
          </View>
        </View>

        <Rule strong />

        {/* Letter to tomorrow-you */}
        <View style={styles.section}>
          <Eyebrow label="LETTER TO TOMORROW-YOU" />
          {sealed ? (
            <View style={styles.sealedBlock}>
              <Text style={styles.sealedIcon}>✉</Text>
              <Text style={styles.sealedText}>{"Sealed. You'll read this tomorrow."}</Text>
            </View>
          ) : letterOpen ? (
            <View style={styles.letterBlock}>
              <TextInput
                style={styles.letterInput}
                placeholder="Write something to tomorrow-you…"
                placeholderTextColor={colors.textQuiet}
                multiline
                value={letter}
                onChangeText={setLetter}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.sealBtn, !letter.trim() && styles.sealBtnDisabled]}
                onPress={handleSealLetter}
                disabled={!letter.trim() || sealing}
                activeOpacity={0.8}
              >
                <Text style={styles.sealBtnText}>{sealing ? 'SEALING…' : 'SEAL & SEND →'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.letterCta}
              onPress={() => setLetterOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.letterCtaText}>WRITE A LETTER →</Text>
              <Text style={styles.letterCtaHint}>
                {"A note you'll read before tomorrow's check-in"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Rule strong />

        {/* Review CTAs */}
        {(isSunday || isLastDay) && (
          <View style={styles.section}>
            {isSunday && (
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={handleWeeklyReview}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewBtnText}>WEEKLY CHECK-UP →</Text>
                <Text style={styles.reviewBtnHint}>Reflect on the week</Text>
              </TouchableOpacity>
            )}
            {isLastDay && (
              <TouchableOpacity
                style={[styles.reviewBtn, isSunday && { marginTop: 10 }]}
                onPress={handleMonthlyReview}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewBtnText}>MONTHLY REVIEW →</Text>
                <Text style={styles.reviewBtnHint}>Close out the month</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Done */}
        <View style={[styles.section, { paddingTop: 0 }]}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.7}>
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderDefault,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scoreBlock: { alignItems: 'center', paddingVertical: scale.xl3, gap: 4 },
  scoreNum: {
    fontFamily: fonts.monoBold,
    fontSize: 80,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
    lineHeight: 84,
  },
  scorePts: { fontFamily: fonts.mono, fontSize: 14, letterSpacing: 3, color: colors.textTertiary },
  section: { paddingVertical: 20 },
  bracketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  bracketLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  bracketVal: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  bracketDanger: { color: colors.danger },
  bracketTotal: { borderBottomWidth: 0, paddingTop: 12 },
  totalLabel: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  totalVal: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
  },
  letterCta: {
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 4,
  },
  letterCtaText: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.amber,
  },
  letterCtaHint: { fontFamily: fonts.display, fontSize: 12, color: colors.textTertiary },
  letterBlock: { marginTop: 10, gap: 12 },
  letterInput: {
    backgroundColor: colors.elevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
    padding: 14,
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sealBtn: {
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.amber,
    alignItems: 'center',
  },
  sealBtnDisabled: { opacity: 0.4 },
  sealBtnText: { fontFamily: fonts.monoBold, fontSize: 13, letterSpacing: 2, color: colors.base },
  sealedBlock: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
  },
  sealedIcon: { fontSize: 28 },
  sealedText: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  reviewBtn: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.amber,
    borderRadius: radius.md,
    gap: 4,
  },
  reviewBtnText: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.amber,
  },
  reviewBtnHint: { fontFamily: fonts.display, fontSize: 12, color: colors.textTertiary },
  doneBtn: {
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
});
