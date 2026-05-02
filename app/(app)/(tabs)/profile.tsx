import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { useMirror } from '@/features/mirror/use-mirror';
import { useHistory } from '@/features/history/use-history';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';
import type { MirrorPhoto } from '@/types/database';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLS = 3;
const GRID_GAP = 6;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;
const TRENDS_RANGES = [30, 90, 365] as const;

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const [trendsRange, setTrendsRange] = useState<30 | 90 | 365>(30);
  const [showMirrorGrid, setShowMirrorGrid] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_stats');
      if (error) throw error;
      return (data as {
        streak: number;
        day_count: number;
        lifetime_avg: number;
        best_score: number | null;
        best_date: string | null;
      }[])?.[0] ?? null;
    },
    enabled: !!user,
  });

  const { data: photos } = useMirror();
  const { data: history } = useHistory(trendsRange);
  const rows = history ?? [];
  const trendsAvg = rows.length ? Math.round(rows.reduce((s, r) => s + r.total_score, 0) / rows.length) : 0;
  const trendsMax = Math.max(...rows.map((r) => r.total_score), 1);

  const navRow = (label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.navText}>{label}</Text>
      <Text style={styles.navArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top + 16 }]}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header */}
        <View style={styles.headerSection}>
          <Text style={styles.name}>{profile?.full_name ?? 'User'}</Text>
          {profile?.identity_sentence ? (
            <Text style={styles.identitySentence}>"{profile.identity_sentence}"</Text>
          ) : null}
        </View>

        {/* ── Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Eyebrow label="STREAK" />
            <Text style={styles.statValue}>{stats?.streak ?? 0}</Text>
            <Text style={styles.statUnit}>DAYS</Text>
          </View>
          <View style={[styles.statItem, styles.statItemCenter]}>
            <Eyebrow label="LIFETIME AVG" />
            <Text style={styles.statValue}>{stats?.lifetime_avg ?? 0}</Text>
            <Text style={styles.statUnit}>PTS</Text>
          </View>
          <View style={styles.statItem}>
            <Eyebrow label="BEST DAY" />
            <Text style={styles.statValue}>{stats?.best_score ?? 0}</Text>
            {stats?.best_date ? (
              <Text style={styles.statUnit}>{fmtDate(stats.best_date)}</Text>
            ) : null}
          </View>
        </View>

        <Rule strong />

        {/* ── Trends */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eyebrow label="TRENDS" />
            <View style={styles.trendsPills}>
              {TRENDS_RANGES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.trendsPill, trendsRange === r && styles.trendsPillActive]}
                  onPress={() => setTrendsRange(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.trendsPillText, trendsRange === r && styles.trendsPillTextActive]}>
                    {r}D
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {rows.length >= 7 ? (
            <>
              <View style={styles.trendsStats}>
                {[
                  { label: 'AVG', val: trendsAvg },
                  { label: 'BEST', val: Math.max(...rows.map((r) => r.total_score)) },
                  { label: 'DAYS', val: rows.length },
                ].map(({ label, val }) => (
                  <View key={label} style={styles.trendsStat}>
                    <Eyebrow label={label} />
                    <Text style={styles.trendsStatVal}>{val}</Text>
                  </View>
                ))}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sparkScroll}>
                <View style={styles.sparkRow}>
                  {rows.slice().reverse().map((r) => {
                    const h = (r.total_score / trendsMax) * 40;
                    return (
                      <View
                        key={r.id}
                        style={[
                          styles.sparkBar,
                          {
                            height: Math.max(h, 2),
                            backgroundColor: r.total_score >= trendsAvg ? colors.amber : colors.lineStrong,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </ScrollView>
              <View style={styles.bracketRows}>
                {(['identity', 'execution', 'outcome', 'penalty'] as const).map((bracket) => {
                  const bAvg = Math.round(
                    rows.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / rows.length,
                  );
                  return (
                    <View key={bracket} style={styles.bracketRow}>
                      <Text style={styles.bracketLabel}>{bracket.toUpperCase()}</Text>
                      <Text style={styles.bracketVal}>{bAvg}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={styles.emptyHint}>Trends appear after 7 days of check-ins.</Text>
          )}
        </View>

        <Rule strong />

        {/* ── Identity */}
        <View style={styles.section}>
          <Eyebrow label="YOUR IDENTITY" />
          <TouchableOpacity
            onPress={() => router.push('/(app)/modal/edit-identity-sentence')}
            activeOpacity={0.7}
            style={styles.editIdentityBtn}
          >
            <Text style={styles.editIdentityText}>EDIT IDENTITY →</Text>
          </TouchableOpacity>
        </View>

        <Rule />

        {/* ── Habits & Scoring */}
        <View style={styles.section}>
          <Eyebrow label="HABITS & SCORING" />
          {navRow('Identity Habits', () =>
            router.push({ pathname: '/(app)/modal/edit-habits', params: { type: 'identity' } }),
          )}
          {navRow('Execution Habits', () =>
            router.push({ pathname: '/(app)/modal/edit-habits', params: { type: 'execution' } }),
          )}
          {navRow('Outcomes', () => router.push('/(app)/modal/edit-outcomes'))}
          {navRow('Penalties', () => router.push('/(app)/modal/edit-penalties'))}
        </View>

        <Rule strong />

        {/* ── Mirror */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eyebrow label="MIRROR" />
            <TouchableOpacity
              onPress={() => router.push('/(app)/modal/mirror-capture')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionAction}>CAPTURE +</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setShowMirrorGrid(true)}
            style={styles.mirrorGridBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.mirrorGridBtnText}>OPEN GRID →</Text>
            {photos && photos.length > 0 && (
              <Text style={styles.mirrorCount}>{photos.length} PHOTOS</Text>
            )}
          </TouchableOpacity>
        </View>

        <Rule strong />

        {/* ── Integrations */}
        <View style={styles.section}>
          <Eyebrow label="INTEGRATIONS" />
          {navRow('Whoop', () => router.push('/(app)/modal/whoop-connect'))}
        </View>

        <Rule />

        {/* ── Account */}
        <View style={styles.section}>
          <Eyebrow label="ACCOUNT" />
          {navRow('Subscription', () => router.push('/(app)/modal/manage-subscription'))}
          {navRow('Notifications', () => router.push('/(app)/modal/notification-settings'))}
          {navRow('Privacy & Data', () => router.push('/(app)/modal/privacy-data'))}
          {navRow('Sign Out', () => router.push('/(app)/modal/signout-confirm'))}
        </View>

        <Text style={styles.footer}>HMC · HALF MILLY CLUB · v1.0</Text>
      </ScrollView>

      {/* ── Mirror Grid Modal */}
      <Modal
        visible={showMirrorGrid}
        animationType="slide"
        onRequestClose={() => setShowMirrorGrid(false)}
      >
        <View style={[styles.gridModal, { paddingTop: insets.top + 8 }]}>
          <View style={styles.gridHeader}>
            <Eyebrow label="MIRROR" />
            <TouchableOpacity onPress={() => setShowMirrorGrid(false)} activeOpacity={0.7}>
              <Text style={styles.gridClose}>CLOSE ✕</Text>
            </TouchableOpacity>
          </View>
          {!photos?.length ? (
            <View style={styles.gridEmpty}>
              <Text style={styles.emptyHint}>No photos yet. Tap CAPTURE + to start.</Text>
            </View>
          ) : (
            <FlatList
              data={photos}
              numColumns={GRID_COLS}
              keyExtractor={(item: MirrorPhoto) => item.id}
              renderItem={({ item }: { item: MirrorPhoto }) => (
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => {
                    setShowMirrorGrid(false);
                    router.push({
                      pathname: '/(app)/modal/mirror-day/[date]',
                      params: { date: item.date },
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: item.photo_url }} style={styles.gridThumb} />
                  <Text style={styles.gridDay}>DAY {item.day_number}</Text>
                </TouchableOpacity>
              )}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  headerSection: { marginBottom: 20 },
  name: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.3 },
  identitySentence: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statItemCenter: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineRegular,
  },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statUnit: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginTop: 1,
  },
  section: { paddingVertical: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionAction: { fontFamily: fonts.monoBold, fontSize: 11, letterSpacing: 1.5, color: colors.amber },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  navText: { fontFamily: fonts.display, fontSize: 15, color: colors.textPrimary },
  navArrow: { fontFamily: fonts.display, fontSize: 20, color: colors.textTertiary },
  editIdentityBtn: { paddingVertical: 8 },
  editIdentityText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.amber },
  // Trends
  trendsPills: { flexDirection: 'row', gap: 6 },
  trendsPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
  },
  trendsPillActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  trendsPillText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textTertiary },
  trendsPillTextActive: { color: colors.base },
  trendsStats: { flexDirection: 'row', marginVertical: 12 },
  trendsStat: { flex: 1, alignItems: 'center', gap: 4 },
  trendsStatVal: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  sparkScroll: { marginVertical: 8 },
  sparkRow: { flexDirection: 'row', alignItems: 'flex-end', height: 44, gap: 2 },
  sparkBar: { width: 4, borderRadius: 1 },
  bracketRows: { marginTop: 8 },
  bracketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  bracketLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary },
  bracketVal: {
    fontFamily: fonts.monoBold,
    fontSize: 15,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  emptyHint: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.textTertiary,
    paddingTop: 8,
    lineHeight: 18,
  },
  // Mirror button
  mirrorGridBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
    borderRadius: 6,
  },
  mirrorGridBtnText: { fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1.5, color: colors.amber },
  mirrorCount: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.textTertiary },
  // Mirror Grid Modal
  gridModal: { flex: 1, backgroundColor: colors.base },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePad,
    paddingBottom: 16,
  },
  gridClose: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  gridRow: { gap: GRID_GAP, marginBottom: GRID_GAP },
  gridItem: { width: GRID_ITEM_SIZE },
  gridThumb: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.25,
    backgroundColor: colors.elevated,
  },
  gridDay: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.pagePad },
  footer: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textQuiet,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
