import { useCallback, useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader } from '@/features/admin';
import { AdminConfirmDialog } from '@/features/admin/components/AdminConfirmDialog';
import { guardWarningLabel } from '@/features/admin/presentation/labels';
import { adminTheme } from '@/features/admin/adminTheme';
import {
  fetchGlobalGenerationGuard,
  setGlobalGenerationEnabled,
  type GlobalGenerationGuard,
} from '@/features/admin/services/globalGenerationGuardService';

// ADMIN_10_SYSTEM_SETTINGS (Stitch final_lock_8). Platform-wide settings. No
// settings-persistence API is connected, so toggles reflect LOCAL UI state only
// and a banner makes clear that changes are NOT saved — nothing is faked as
// persisted, and "변경사항 저장" shows a truthful not-connected note (§22/§27).

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: adminTheme.surface,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        padding: 20,
        gap: 16,
        flex: 1,
        minWidth: 320,
      }}
    >
      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// Not-yet-connected settings: the toggle is DISABLED (§J9) so an operator can't flip a control that persists
// nothing. Re-enable with a real onValueChange when the settings-save API is wired.
function ToggleRow({ label, hint }: { label: string; hint?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
          {label}
        </Text>
        {hint ? (
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch accessibilityLabel={label} value={false} disabled trackColor={{ true: adminTheme.navy }} />
    </View>
  );
}

function SelectRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
        {label}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          {hint}
        </Text>
      ) : null}
      <View
        style={{
          borderWidth: 1,
          borderColor: adminTheme.border,
          borderRadius: 4,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: adminTheme.pageBg,
        }}
      >
        <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>{label}</Text>
      <Text variant="bodyMedium" style={{ color: tone ?? adminTheme.inkVariant, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

// REAL global generation guard (Sprint D §D8) — reads backend truth + the kill switch. Fail-clean: on any
// error / no admin access it shows a "연동 필요" note instead of faking state (제3조). Limits are read-only
// here (100/hour · 1000/day technical defaults pending owner approval).
function GenerationGuardCard() {
  const [guard, setGuard] = useState<GlobalGenerationGuard | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  // ⚠ 토글을 즉시 반영하지 않는다. 스위치는 **요청**만 만들고, 실제 반영은 확인 뒤에 일어난다.
  //   2026-09-06 이전에는 onValueChange 가 곧바로 서버를 바꿨다 — 화면을 훑다가 스치기만 해도
  //   전 사용자의 유료 생성이 멈췄고, 멈췄다는 사실을 알려 주는 것이 아무것도 없었다.
  const [pending, setPending] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const g = await fetchGlobalGenerationGuard();
    setGuard(g);
    setLoaded(true);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const onToggle = useCallback(
    (next: boolean) => {
      if (!guard || saving) return;
      setPending(next);
    },
    [guard, saving],
  );

  const applyPending = useCallback(async () => {
    if (!guard || pending === null) return;
    setSaving(true);
    const ok = await setGlobalGenerationEnabled(pending, guard.hourlyLimit, guard.dailyLimit);
    if (ok) await load();
    setSaving(false);
    setPending(null);
  }, [guard, pending, load]);

  const warnTone =
    guard?.warningLevel === 'CRITICAL_95' ? adminTheme.warning : guard?.warningLevel === 'WARNING_80' ? adminTheme.warning : adminTheme.inkVariant;

  return (
    <Card title="생성 제어 (전역 비용 가드)">
      {!loaded ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>불러오는 중…</Text>
      ) : guard === null ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          연동 필요 — 관리자 권한이 있고 마이그레이션이 적용된 뒤 전역 생성 상태가 표시됩니다.
        </Text>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>LLM 생성 사용</Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                끄면 새 유료 생성이 즉시 중단됩니다(캐시·기존 답변은 계속 제공).
              </Text>
            </View>
            <Switch accessibilityLabel="AI 생성 허용" value={guard.generationEnabled} disabled={saving} onValueChange={onToggle} trackColor={{ true: adminTheme.navy }} />
          </View>
          <InfoRow label="시간당 사용/한도" value={`${guard.hourlyUsed} / ${guard.hourlyLimit}`} />
          <InfoRow label="일일 사용/한도" value={`${guard.dailyUsed} / ${guard.dailyLimit}`} />
          <InfoRow label="사용률 · 경고 단계" value={`${guard.utilizationPercent}% · ${guardWarningLabel(guard.warningLevel)}`} tone={warnTone} />

          {/* 끄는 쪽과 켜는 쪽 **둘 다** 확인을 받는다. 토글은 방향을 구분하지 않으므로,
              잘못 건드리는 사고는 양방향으로 똑같이 일어난다. 그리고 재개는 "지출을 다시 연다" 는
              결정이라 그 자체로 한 번 볼 값어치가 있다. 문구를 방향별로 달리 줘서 지금 어느 쪽인지
              오너가 확실히 알게 한다. */}
          <AdminConfirmDialog
            visible={pending !== null}
            busy={saving}
            title={pending === false ? 'AI 생성을 중지할까요?' : 'AI 생성을 재개할까요?'}
            what={
              pending === false
                ? '새로 시작되는 유료 생성이 전부 즉시 거절됩니다 — 상담·궁합·Premium·오늘의 운세·월간 운세 전부입니다.'
                : '새 유료 생성이 다시 허용됩니다. OpenAI 비용이 다시 발생하기 시작합니다.'
            }
            scope={
              pending === false
                ? '모든 사용자에게 즉시 적용됩니다. 이미 시작된 요청은 끝까지 마칩니다 — 가드는 요청을 받을 때 한 번만 보기 때문입니다. 이미 만들어진 답변과 캐시는 그대로 보입니다.'
                : `모든 사용자에게 즉시 적용됩니다. 시간당 ${guard.hourlyLimit}건 · 하루 ${guard.dailyLimit}건 한도 안에서 다시 동작합니다.`
            }
            reversible={
              pending === false
                ? '되돌릴 수 있습니다 — 같은 스위치를 다시 켜면 즉시 재개됩니다. 다만 중지된 동안 거절된 요청은 사용자가 다시 시도해야 합니다.'
                : '되돌릴 수 있습니다 — 같은 스위치를 다시 끄면 즉시 중지됩니다.'
            }
            confirmLabel={pending === false ? '중지합니다' : '재개합니다'}
            onCancel={() => setPending(null)}
            onConfirm={() => void applyPending()}
          />
        </>
      )}
    </Card>
  );
}

export default function AdminSystemSettingsScreen() {
  return (
    <Stack gap="xl">
      <Stack direction="row" align="center" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <AdminPageHeader title="시스템 설정" subtitle="덕분AI 플랫폼의 전역 설정을 관리합니다." />
        <View style={{ backgroundColor: adminTheme.neutralBg, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontWeight: '600' }}>
            변경사항 저장 (API 미연결)
          </Text>
        </View>
      </Stack>

      <View style={{ backgroundColor: adminTheme.warningBg, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 16 }}>
        <Text variant="bodySmall" style={{ color: adminTheme.warning }}>
          이 화면의 설정은 아직 백엔드 설정 API에 연결되지 않았습니다. 변경은
          저장되지 않으며, 실제 반영은 연동 후 가능합니다.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <Stack gap="lg" style={{ flex: 2, minWidth: 380 }}>
          <Card title="AI 설정">
            <SelectRow label="기본 해석 모델" hint="운세 해석에 주로 사용될 대규모 언어 모델" value="연동 후 선택 가능" />
            <SelectRow label="보조 필터링 모델" hint="부적절한 내용 필터링 및 응답 검수" value="연동 후 선택 가능" />
            <ToggleRow label="동적 모델 스위칭 (Fall-back)" hint="기본 모델 장애 시 자동으로 보조 모델로 전환" />
          </Card>
          <Card title="운세우편 설정">
            <SelectRow label="일일 운세 자동 발송 시점" value="연동 후 설정 가능 (KST 기준)" />
            <SelectRow label="재발송 대기 시간 (실패 시)" value="연동 후 설정 가능" />
            <ToggleRow label="주말 자동 발송 활성화" />
            <ToggleRow label="발송 실패 관리자 알림" />
          </Card>
        </Stack>

        <Stack gap="lg" style={{ flex: 1, minWidth: 280 }}>
          <GenerationGuardCard />
          <Card title="관리자 설정">
            <ToggleRow label="2단계 인증 (2FA) 강제" />
            <ToggleRow label="관리자 활동 로그 기록" />
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
              API 키 관리는 별도 보안 콘솔에서 처리됩니다.
            </Text>
          </Card>
          <Card title="알림 설정">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
                Slack (Dev 채널)
              </Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                미연결
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
                SMS (긴급 장애)
              </Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                미연결
              </Text>
            </View>
          </Card>
        </Stack>
      </View>
    </Stack>
  );
}
