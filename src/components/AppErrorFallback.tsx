import { Pressable, StyleSheet, Text, View } from 'react-native';

// App crash fallback (monitoring §59). Shown by the root ErrorBoundary when a screen throws during render.
// Deliberately self-contained — bare react-native primitives and hardcoded frozen-palette literals — so it renders
// even if the theme provider or another shared context was part of the crashed subtree. NEVER shows a stack
// trace or the raw error; only a friendly message and a retry that re-mounts the tree.
export function AppErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>문제가 발생했어요</Text>
      <Text style={styles.body}>일시적인 오류일 수 있어요. 잠시 후 다시 시도해 주세요.</Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={styles.btn}>
        <Text style={styles.btnText}>다시 시도</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, backgroundColor: '#FDFBF6' },
  title: { fontSize: 18, fontWeight: '700', color: '#2E2A24' },
  body: { fontSize: 14, color: '#6B6357', textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 8, backgroundColor: '#33302A', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  btnText: { color: '#FDFBF6', fontWeight: '700', fontSize: 15 },
});
