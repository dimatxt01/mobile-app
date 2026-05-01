import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/hmc-colors';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false }: ScreenProps) {
  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content]}>{children}</View>
  );

  return <SafeAreaView style={styles.container}>{inner}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.pagePad, paddingVertical: 32 },
});
