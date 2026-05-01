import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMirror } from '@/features/mirror/use-mirror';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import type { MirrorPhoto } from '@/types/database';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = (SCREEN_WIDTH - 40 - 8) / 2;
const ITEM_HEIGHT = ITEM_WIDTH * 1.25;

export default function MirrorScreen() {
  const insets = useSafeAreaInsets();
  const { data: photos } = useMirror();

  const renderItem = ({ item }: { item: MirrorPhoto }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: '/(app)/modal/mirror-day/[date]', params: { date: item.date } })
      }
    >
      <Image source={{ uri: item.photo_url }} style={styles.thumb} />
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{item.date}</Text>
        <Text style={styles.cardDay}>DAY {item.day_number}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Eyebrow label="MIRROR" />
        <TouchableOpacity onPress={() => router.push('/(app)/modal/mirror-capture')}>
          <Text style={styles.captureBtn}>CAPTURE +</Text>
        </TouchableOpacity>
      </View>

      {!photos?.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No photos yet.</Text>
          <Text style={styles.emptyHint}>Tap CAPTURE + to take your first mirror selfie.</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureBtn: { fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1.5, color: colors.amber },
  row: { gap: 8, marginBottom: 8 },
  card: {
    width: ITEM_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.elevated,
  },
  thumb: { width: ITEM_WIDTH, height: ITEM_HEIGHT },
  cardFooter: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDate: { fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary },
  cardDay: { fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.display, fontSize: 16, color: colors.textTertiary },
  emptyHint: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
});
