// 관리자 전용 확인 대화상자 — **되돌릴 수 없는 동작 앞에 한 겹.**
//
// WHY. 2026-09-06 관리자 26화면 전수 조사에서 가장 무거운 발견이 이것이었다: 전체 유료 AI 생성을
// 멈추는 킬 스위치가 **확인 없는 토글 하나**였다. 화면을 훑다가 잘못 건드리면 상담·궁합·Premium·
// 운세가 즉시 전부 멈추고, 멈췄다는 사실을 알려 주는 것이 아무것도 없었다. 메일 즉시 발송과 유명인
// 발행도 같은 상태였다 — 회수도 취소도 안 되는데 클릭 한 번이었다.
//
// 무엇을 말하는가. "정말 하시겠습니까?" 는 아무 정보도 주지 않는다. 오너는 비개발자이고, 그 물음에
// 답하려면 **무엇이 일어나는지 · 어디까지 미치는지 · 되돌릴 수 있는지** 셋을 알아야 한다.
// 그래서 세 줄을 필수 prop 으로 받는다. 부를 때 셋을 다 채우도록 강제하는 것이 이 컴포넌트의 핵심이다.
//
// 취소가 기본이다. 취소가 **왼쪽에 먼저** 오고 중립색이며, 실행은 오른쪽에 danger 로 온다.
// danger 는 "누르세요" 가 아니라 "조심하세요" 로 읽히는 색이다. 스크림을 눌러도 취소된다.
//
// 토큰만 쓴다. adminTheme 과 Text variant 밖의 색값·글자 크기를 새로 만들지 않는다.
// adminTheme 은 고정 팔레트라 다크 분기가 없다(관리자는 데스크톱 전용 화면이다).
//
// ⚠ 접근성. `accessibilityState` 를 쓰지 않는다(`accessibilityContract.test.ts`).
//   Pressable 에는 이름과 역할을 **함께** 준다 — 같은 계약의 다른 조항이다.
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { adminTheme } from '../adminTheme';

export type AdminConfirmDialogProps = {
  visible: boolean;
  /** 무엇을 하려는지. 제목이자 대화상자의 접근 이름. */
  title: string;
  /** ① 지금 무슨 일이 일어나는가. */
  what: string;
  /** ② 어디까지 미치는가 — 누구에게, 몇 명에게, 어느 기능에. */
  scope: string;
  /** ③ 되돌릴 수 있는가. 되돌릴 수 있으면 그 방법까지. */
  reversible: string;
  /** 추가로 짚어야 할 것(법률·정책 등). 없으면 생략된다. */
  notice?: string | null;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function Row({ n, label, value }: { n: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text variant="caption" style={styles.rowNum}>
          {n}
        </Text>
        <Text variant="caption" style={{ color: adminTheme.inkMuted, fontWeight: '700' }}>
          {label}
        </Text>
      </View>
      <Text variant="bodySmall" style={{ color: adminTheme.ink }}>
        {value}
      </Text>
    </View>
  );
}

export function AdminConfirmDialog({
  visible,
  title,
  what,
  scope,
  reversible,
  notice,
  confirmLabel,
  busy = false,
  onCancel,
  onConfirm,
}: AdminConfirmDialogProps) {
  // ⚠ Modal 의 visible 에만 기대지 않는다. 렌더 하네스에서 이 컴포넌트가 RNW Modal 을 처음 쓰는데,
  //   닫힌 Modal 의 자식이 문서에 남는 것이 확인됐다. 닫혀 있으면 **아무것도 만들지 않는다** —
  //   확인 창의 문구가 화면 뒤에 살아 있는 것은 그 자체로 결함이다(스크린 리더가 읽는다).
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.root}>
        {/* 스크림을 눌러도 취소된다 — 빠져나가는 길이 실행보다 넓어야 한다. */}
        <Pressable
          style={styles.scrim}
          accessibilityRole="button"
          accessibilityLabel="취소하고 닫기"
          onPress={onCancel}
        />
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
              {title}
            </Text>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Row n="1" label="하는 일" value={what} />
            <Row n="2" label="영향 범위" value={scope} />
            <Row n="3" label="되돌리기" value={reversible} />
            {notice ? (
              <View style={styles.notice}>
                <Text variant="bodySmall" style={{ color: adminTheme.warning, fontWeight: '700' }}>
                  {notice}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {/* 취소가 먼저·중립, 실행은 뒤·danger. 기본값은 그만두는 쪽이다. */}
          <View style={styles.footer}>
            <Button variant="secondary" label="취소" onPress={onCancel} />
            <Button
              variant="danger"
              label={busy ? '처리 중…' : confirmLabel}
              onPress={onConfirm}
              disabled={busy}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // `absoluteFillObject` 는 이 RN 타입 정의에 없다. 같은 뜻을 직접 쓴다.
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(4,22,39,0.35)' },
  // 360dp 에서도 깨지지 않게: 최대폭은 두되 폭은 100% 로 두고 여백을 바깥에서 준다.
  panel: {
    width: '100%',
    maxWidth: 480,
    marginHorizontal: 16,
    backgroundColor: adminTheme.surface,
    borderWidth: 1,
    borderColor: adminTheme.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: adminTheme.border,
  },
  body: { maxHeight: 380 },
  bodyContent: { padding: 20, gap: 16 },
  row: { gap: 4 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowNum: { color: adminTheme.inkVariant, fontWeight: '700' },
  notice: {
    backgroundColor: adminTheme.warningBg,
    borderRadius: 8,
    padding: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: adminTheme.border,
    backgroundColor: adminTheme.pageBg,
  },
});
