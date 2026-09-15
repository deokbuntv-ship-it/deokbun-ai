// 변곡점 알림 **생산자** — 명식을 읽고, 문구를 만들고, 없으면 넣는다.
//
// 언제 도는가: **앱을 열 때**(사용자 명식이 준비된 뒤 한 번).
//   · 배치(`run-scheduled-notifications`)로 옮기면 스케줄러·CRON_SECRET·서버 엔진 의존이 셋 생긴다.
//     엔진은 이미 클라이언트에서 돈다(`consultationGrounding` 선례). 여기서 도는 편이 단순하다.
//   · `createIfAbsent` 가 `unique(user_id, dedup_key)` 위에서 `ignoreDuplicates` 로 동작하므로
//     **매번 불러도 중복이 생기지 않는다.** 멱등성이 앱이 아니라 DB 제약에 있다 — 그것이 안전하다.
//   · 계산 비용은 명식 하나당 수십 ms 다(`turningPoint.test.ts` 가 200ms 상한으로 잠근다).
//
// ⚠ 실패해도 앱을 막지 않는다. 알림은 부가 기능이고, 명식이 안 서면 **아무것도 만들지 않는다** —
//   그것이 시각 미상·경계일 사용자에게 맞는 동작이다(엔진이 스스로 판정 불가를 알린다).
//
// ⚠ LLM 0콜. 문구는 `turningPoint.ts` 의 템플릿이 만든다.
import * as Crypto from 'expo-crypto';

import type { BirthInfoDraft } from '@/features/consultation';
import { buildPremiumEvidence } from '@/features/premium/engine/premiumEvidence';

import { notificationTypeSpec } from '../notificationTypes';
import { inAppNotificationService } from './inAppNotificationService';
import { buildTurningPoints, type TurningPoint } from '../turningPoint';

const digestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input, {
      encoding: Crypto.CryptoEncoding.HEX,
    });
  },
};

/** 순수 부분 — 명식에서 변곡점 목록까지. 테스트가 여기를 직접 부른다. */
export async function computeTurningPoints(
  birthInfo: BirthInfoDraft,
  nowEpochSeconds: number,
): Promise<TurningPoint[]> {
  const ev = await buildPremiumEvidence({ birthInfo }, { digestProvider, nowEpochSeconds });
  if (!ev.available) return [];
  return buildTurningPoints(ev);
}

/**
 * 앱 열 때 한 번. 만들어진 개수를 돌려준다(0 이면 새 변곡점이 없거나 이미 다 넣었다는 뜻).
 *
 * ⚠ 던지지 않는다. 알림 하나 때문에 홈이 안 뜨는 일은 없어야 한다.
 */
export async function syncTurningPointNotifications(
  birthInfo: BirthInfoDraft | null | undefined,
  nowEpochSeconds: number = Math.floor(Date.now() / 1000),
): Promise<number> {
  if (!birthInfo) return 0;
  try {
    const points = await computeTurningPoints(birthInfo, nowEpochSeconds);
    const spec = notificationTypeSpec('TURNING_POINT');
    for (const tp of points) {
      await inAppNotificationService.createIfAbsent({
        category: spec.category,
        title: tp.title,
        body: tp.body,
        deepLinkTarget: spec.deepLinkTarget,
        deepLinkId: null,
        dedupKey: tp.dedupKey,
      });
    }
    return points.length;
  } catch {
    return 0;
  }
}
