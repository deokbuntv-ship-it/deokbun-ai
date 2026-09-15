import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminSelect,
  AdminStateView,
  adminOpsService,
  type AdminAiUsageItem,
  type AdminColumn,
} from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import { aggregateUsageCost } from '@/features/admin/operational/operationalContracts';
import { UNPRICED_LABEL } from '@/features/admin/operational/modelPricing';
import { AdminConfirmDialog } from '@/features/admin/components/AdminConfirmDialog';
import {
  adminPricingService,
  repositoryFromRows,
  summarizeWindow,
  NOT_INSTALLED_LABEL,
  type CostWindowOutcome,
  type CostWindowRow,
  type FxRateRow,
  type ModelPriceRow,
} from '@/features/admin/services/adminPricingService';
// 5 · 12 · 50덕. 표시 전용 단일 출처이고 서버(`economy_policy`)가 권위다 — 여기서 바꾸지 않는다.
import { DUK_PRICES } from '@/features/duk/pricing';

// ADMIN_08_AI_COST — **원가를 돈으로 보는 화면.** (§9/§10/§27: 지어낸 금액 금지)
//
// 이 화면에 금액이 두 종류로 나오고, **범위가 다르다.** 섞어 읽으면 숫자가 안 맞아 보인다:
//   ① 위쪽 "최근 24시간" — 서버 집계(`admin_ai_cost_window`). **캐시된 입력을 반영한다.**
//   ② 아래쪽 "모델별 · 상품별" — **지금 보이는 50건**(`admin_list_ai_usage`). 그 RPC 가 캐시
//      컬럼을 안 줘서 실제 청구보다 크게 나온다(staging 803건 실측 **+6.2%**, 적중률 38.8%).
//   상품별(request_type) 분해는 ② 에만 있다 — 집계 RPC 는 모델별로만 묶는다.
//
// ⚠ 단가·환율·덕 값은 **전부 표에서 온다**(`model_pricing`·`fx_rate`). 코드에 기본값이 없다.
//   비어 있으면 숫자가 아니라 "가격 미확인" 이 나온다 — **0원이 아니다.**
//   `adminPricingContract.test.ts` 가 이 경계를 소스 스캔으로 잠근다.
//
// ⚠ 2026-09-07 — 자리표시자 두 장(비용 추이·예측 / 임계값 설정)을 지웠다. 지키지 않을 약속을
//   화면에 붙여 두는 것이 빈 자리보다 나쁘다.

/** 원가 창의 길이. "오늘" 을 자정 기준으로 자르면 새벽 1시에 화면이 텅 빈다. 24시간이 답한다. */
export const COST_WINDOW_HOURS = 24;

/**
 * `undefined` 로딩 · `null` **모름**(RPC 실패/미적용) · `[]` 0건.
 * ⚠ 셋을 섞지 않는다. "모른다" 를 0원으로 그리는 순간 이 화면은 거짓말을 시작한다.
 */
type Win = readonly CostWindowRow[] | null | undefined;

/**
 * 집계 조회 결과 — `undefined` 는 로딩. 나머지 네 갈래는 서비스가 판정한다.
 * ⚠ "설치 안 됨" 과 "실패" 를 한 문장으로 묶지 않는다. 오너가 할 일이 서로 다르다 —
 *   앞쪽은 마이그레이션을 올리는 것이고 뒤쪽은 다시 눌러 보는 것이다.
 */
type Outcome = CostWindowOutcome | undefined;

const krwText = (n: number) => `₩${Math.round(n).toLocaleString()}`;

/**
 * 최근 24시간 원가 — **이 화면에서 "오늘 얼마" 에 답하는 유일한 자리.**
 *
 * ⚠ 아래 "모델별 · 상품별" 표와 값이 다르다. 여기는 창 전체 집계(`admin_ai_cost_window`)이고
 *   아래는 **지금 보이는 50건**이다. 그리고 여기만 **캐시된 입력을 반영한다** — 목록 RPC 가 그
 *   컬럼을 안 줘서 아래 표는 실제 청구보다 크게 나온다(staging 803건 실측 **+6.2%**, 적중률 38.8%).
 *
 * ⚠ 자리표시자 두 장(비용 추이·예측 / 임계값 설정)을 여기서 지웠다. 지키지 않을 약속을 화면에
 *   붙여 두는 것이 빈 자리보다 나쁘고, 추이·예측·임계값은 이번에 만들지 않기로 한 것들이다.
 */
function CostWindowCard({
  win,
  prices,
  fx,
  dukKrw,
}: {
  win: Outcome;
  prices: readonly ModelPriceRow[];
  fx: FxRateRow | null;
  dukKrw: FxRateRow | null;
}) {
  const rows = win !== undefined && win.kind === 'ok' ? win.rows : null;
  const sum = useMemo(
    () => (rows && rows.length > 0 ? summarizeWindow(rows, prices, fx?.rate ?? null) : null),
    [rows, prices, fx],
  );

  // 마진. **덕 단가가 있어야만 낸다** — 없으면 계산하지 않는다(0으로 두면 마진 100%가 된다).
  const margin = useMemo(() => {
    if (!sum || !dukKrw || sum.priced === 0 || sum.krw === null || sum.requests === 0) return null;
    const perCallKrw = sum.krw / sum.requests;
    const perCallDuk = perCallKrw / dukKrw.rate;
    return { perCallKrw, perCallDuk };
  }, [sum, dukKrw]);

  return (
    <View style={{ gap: 8, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 10, padding: 16, backgroundColor: adminTheme.surface }}>
      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
        최근 {COST_WINDOW_HOURS}시간 AI 비용
      </Text>

      {win === undefined ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>불러오는 중…</Text>
      ) : win.kind === 'not_installed' ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
          {NOT_INSTALLED_LABEL}
          {' '}단가 마이그레이션 20260915000000_model_pricing.sql 을 적용하면 이 카드가 켜집니다.
          화면이 고장난 것이 아닙니다.
        </Text>
      ) : win.kind === 'forbidden' ? (
        <Text variant="bodySmall" style={{ color: adminTheme.warning }}>
          ⚠ 이 계정에는 원가 집계를 볼 권한이 없습니다. 관리자 권한을 확인해 주세요.
        </Text>
      ) : win.kind === 'failed' ? (
        <Text variant="bodySmall" style={{ color: adminTheme.warning }}>
          ⚠ 집계를 불러오지 못했습니다. 금액을 **모르는 것이지 0원이 아닙니다.** 잠시 뒤 다시 열어 주세요.
        </Text>
      ) : win.rows.length === 0 ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
          최근 {COST_WINDOW_HOURS}시간 동안 AI 요청이 없었습니다. 원가 ₩0 입니다.
        </Text>
      ) : (
        <>
          {/* ⚠ 단가가 하나도 없으면 합이 0이지만 그것은 **0원이 아니라 "모른다"** 다.
              ₩0 을 그리면 "돈을 안 썼다" 로 읽힌다 — 렌더 테스트가 잡은 결함이다. */}
          <Text variant="headingLarge" style={{ color: adminTheme.ink }}>
            {!sum || sum.priced === 0
              ? UNPRICED_LABEL
              : sum.krw !== null ? krwText(sum.krw) : `$${sum.usd.toFixed(4)}`}
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
            {sum ? `${sum.requests.toLocaleString()}건` : ''}
            {sum && sum.priced > 0 ? ` · $${sum.usd.toFixed(4)}` : ''}
            {sum && sum.priced > 0 && sum.krw === null ? ' · ⚠ 환율 미입력이라 원화가 없습니다' : ''}
            {sum && sum.priced === 0 ? ' · ⚠ 단가를 넣기 전에는 금액을 알 수 없습니다 (0원이 아닙니다)' : ''}
          </Text>
          {sum && sum.unpriced.length > 0 ? (
            <Text variant="caption" style={{ color: adminTheme.warning }}>
              ⚠ 단가가 없어 금액에 **더하지 않은** 모델: {sum.unpriced.join(', ')}. 위 금액은 그만큼 적습니다
              (0원으로 더하면 "쌌다" 로 읽히므로 빼 두었습니다).
            </Text>
          ) : null}
          <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
            캐시된 입력을 반영한 값입니다 — 아래 목록 기준 표보다 정확합니다.
          </Text>

          {margin ? (
            <View style={{ gap: 4, marginTop: 6, borderTopWidth: 1, borderTopColor: adminTheme.border, paddingTop: 8 }}>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
                마진 — 덕 1개 {krwText(dukKrw!.rate)} 기준
              </Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
                건당 원가 {krwText(margin.perCallKrw)} = {margin.perCallDuk.toFixed(3)}덕 ·{' '}
                {(['general', 'compatibility', 'premium_report'] as const)
                  .map((k) => `${DUK_PRICES[k]}덕이면 ${(100 - (margin.perCallDuk / DUK_PRICES[k]) * 100).toFixed(1)}%`)
                  .join(' · ')}{' '}
                남습니다
              </Text>
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                ⚠ 덕은 **미리** 팔립니다. 충전할 때 돈이 들어오고 원가는 상담할 때 나가므로,
                "이번 달 매출 − 이번 달 원가" 로는 마진이 맞지 않습니다. 위 숫자는 그 시점 차이를 없앤
                것입니다 — **이번에 태운 덕의 값어치 − 실제로 나간 원가**. 덕이 팔릴 때가 아니라
                쓰일 때 매출로 봅니다.
              </Text>
              <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
                ⚠ 건당 원가는 상담·운세·유명인이 **섞인** 평균입니다. 상품별로는 아래 표를 보십시오.
              </Text>
            </View>
          ) : (
            <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
              ⚠ 마진은 아직 볼 수 없습니다 — 아래에서 **덕 1개의 값**을 넣으면 나옵니다.
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const TYPE_FILTER_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'chat', label: '상담' },
  { value: 'content_generate', label: '콘텐츠' },
  { value: 'famous_suggest', label: 'Famous' },
  { value: 'image_generate', label: '이미지' },
  { value: 'video_generate', label: '영상' },
];

type Status = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 50;

const COLUMNS: AdminColumn[] = [
  { key: 'createdAt', header: '시각', flex: 3 },
  { key: 'type', header: '유형', flex: 3 },
  { key: 'model', header: '모델', flex: 3 },
  { key: 'status', header: '상태', flex: 2 },
  { key: 'input', header: '입력', flex: 1, align: 'right' },
  { key: 'output', header: '출력', flex: 1, align: 'right' },
  { key: 'latency', header: '지연(ms)', flex: 2, align: 'right' },
];

const REQUEST_TYPE_LABEL: Record<string, string> = {
  chat: '상담',
  content_generate: '콘텐츠 생성',
  famous_suggest: 'Famous 제안',
  image_generate: '이미지 생성',
  video_generate: '영상 생성',
};

function formatDateTime(iso: string | null): string {
  return iso ? iso.slice(0, 16).replace('T', ' ') : '–';
}

// Thousands-separated counts/latency (1945 → 1,945). Null stays as an em dash.
function formatCount(n: number | null | undefined): string {
  return typeof n === 'number' ? n.toLocaleString() : '–';
}

// Model-breakdown cost from the CURRENTLY-LOADED usage rows (§5.5/§5.6). Verified-pricing models show a real USD
// cost; unverified models (e.g. gpt-5.6-terra) show "가격 미확인" — never a fabricated number. Windowed all-time
// cost still needs server aggregation, so this is scoped to the loaded page and labeled as such.
function CostByModel({
  items,
  prices,
  fx,
  dukKrw,
}: {
  items: AdminAiUsageItem[];
  prices: readonly ModelPriceRow[];
  fx: FxRateRow | null;
  dukKrw: FxRateRow | null;
}) {
  const repo = useMemo(() => repositoryFromRows(prices), [prices]);
  const toRows = (list: AdminAiUsageItem[]) =>
    list.map((i) => ({
      model: i.model ?? 'unknown',
      inputTokens: i.inputTokens ?? 0,
      // ⚠ 캐시된 입력은 단가가 10배 싸지만 `admin_list_ai_usage` 가 그 컬럼을 돌려주지 않는다.
      //   0으로 두면 원가가 **과대 추정**된다 — 실제 청구보다 크게 나온다. 안전한 방향이지만
      //   사실이므로 화면에 적는다. 정확히 하려면 RPC 반환에 컬럼을 더해야 한다(이번 범위 밖).
      cachedInputTokens: 0,
      outputTokens: i.outputTokens ?? 0,
    }));
  const agg = useMemo(() => aggregateUsageCost(toRows(items), repo.asMap()), [items, repo]);

  // 상품별(=request_type) 건당 원가. 마진을 보려면 이것이 있어야 한다.
  const byType = useMemo(() => {
    const groups = new Map<string, AdminAiUsageItem[]>();
    for (const i of items) {
      const k = i.requestType ?? '기타';
      const cur = groups.get(k);
      if (cur) cur.push(i); else groups.set(k, [i]);
    }
    return [...groups.entries()]
      .map(([type, list]) => ({ type, n: list.length, cost: aggregateUsageCost(toRows(list), repo.asMap()).cost }))
      .sort((a, b) => b.n - a.n);
  }, [items, repo]);

  const krw = (usd: number) => (fx ? `₩${Math.round(usd * fx.rate).toLocaleString()}` : null);
  if (agg.byModel.length === 0) return null;
  return (
    <View style={{ gap: 8 }}>
      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
        모델별 비용 · 현재 조회된 로그 기준
      </Text>
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        {prices.length === 0
          ? '⚠ 단가가 아직 입력되지 않았습니다. 아래 “모델 단가·환율”에서 넣으면 금액이 보입니다. 넣기 전까지는 0원이 아니라 “가격 미확인”입니다.'
          : `단가가 입력된 모델만 금액을 보여 줍니다${fx ? '' : ' (환율 미입력 — 원화는 표시되지 않습니다)'}. `
            + '지금 조회된 목록 기준이고 오늘 전체가 아닙니다. '
            + '⚠ 캐시된 입력 토큰은 로그에서 받지 못해 일반 입력으로 계산되므로, 실제 청구보다 **크게** 나옵니다.'}
      </Text>
      {agg.byModel.map((m) => (
        <View key={m.model} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
          <Text variant="bodySmall" style={{ color: adminTheme.ink }}>
            {m.model}
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
            {m.requests}건 · 입력 {m.inputTokens.toLocaleString()} · 출력 {m.outputTokens.toLocaleString()} ·{' '}
            {m.cost ? `${m.cost.total.toFixed(4)}${krw(m.cost.total) ? ` · ${krw(m.cost.total)}` : ''}` : UNPRICED_LABEL}
          </Text>
        </View>
      ))}

      {/* ⚠ 상품별 건당 원가 — 마진을 보려면 이것이 있어야 한다. 덕 가격은 오너가 알고 있으므로,
          "이 상품 한 건에 얼마 나갔나" 만 있으면 마진을 손으로 확인할 수 있다.
          ⚠ **마진 퍼센트는 내지 않는다.** 매출 쪽(`priceKrwHint`)이 코드에 "display hypothesis,
          not a charge" 라고 적힌 가설이고 IAP 도 아직 비활성이다. 가설 × 실측으로 "마진 96%" 를
          찍으면 그것이 곧 지어낸 숫자가 된다. 원가만 사실로 내고 비교는 사람이 한다. */}
      {byType.length > 0 ? (
        <View style={{ gap: 6, marginTop: 8 }}>
          <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
            상품별 건당 원가 · 현재 조회된 로그 기준
          </Text>
          {byType.map((t) => (
            <View key={t.type} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
              <Text variant="bodySmall" style={{ color: adminTheme.ink }}>{t.type}</Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
                {t.cost
                  ? `${t.n}건 · 건당 ${(t.cost.total / t.n).toFixed(5)}${
                      krw(t.cost.total / t.n) ? ` · ${krw(t.cost.total / t.n)}` : ''}${
                      // ⚠ 원가를 **덕으로** 환산한다. 상담 가격이 덕이라 같은 단위여야 마진이 눈에 보인다.
                      //   request_type 을 상품(5·12·50덕)에 자동으로 매핑하지 않는다 — staging 에서
                      //   `chat` 하나에 mini(일반)와 terra(궁합·Premium)가 섞여 있었다. 추측해서
                      //   매핑하면 그 순간 마진이 지어낸 숫자가 된다. 덕 환산만 내고 비교는 사람이 한다.
                      dukKrw && fx ? ` · ${((t.cost.total / t.n) * fx.rate / dukKrw.rate).toFixed(3)}덕` : ''}`
                  : `${t.n}건 · ${UNPRICED_LABEL}`}
              </Text>
            </View>
          ))}
          {byType.some((t) => t.n < 20) ? (
            <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
              ⚠ 표본이 20건 미만인 상품이 있습니다. 건당 평균은 아직 흔들립니다. 실패한 요청도 토큰을 씁니다.
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// 모델 단가·환율 입력 — **이 화면에 두는 이유**: 원가를 보는 자리와 단가를 고치는 자리가 같아야
// "숫자가 이상한데" → "단가를 고친다" 가 한 화면에서 끝난다. `system-settings` 로 보내면 두 화면을
// 오가야 하고, 그 화면은 이미 연동 대기 항목으로 붐빈다.
function PricingCard({
  prices,
  fx,
  dukKrw,
  win,
  onSaved,
}: {
  prices: readonly ModelPriceRow[];
  fx: FxRateRow | null;
  dukKrw: FxRateRow | null;
  win: Win;
  onSaved: () => void;
}) {
  const [model, setModel] = useState('');
  const [inp, setInp] = useState('');
  const [cached, setCached] = useState('');
  const [outp, setOutp] = useState('');
  const [rate, setRate] = useState('');
  const [duk, setDuk] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'price' | 'fx' | 'duk' | null>(null);

  const nInp = Number(inp);
  const nOut = Number(outp);
  const nCached = cached.trim() === '' ? null : Number(cached);
  const nRate = Number(rate);
  const nDuk = Number(duk);
  const priceOk = model.trim().length > 0 && Number.isFinite(nInp) && nInp >= 0
    && Number.isFinite(nOut) && nOut >= 0 && (nCached === null || (Number.isFinite(nCached) && nCached >= 0));
  const fxOk = Number.isFinite(nRate) && nRate > 0;
  const dukOk = Number.isFinite(nDuk) && nDuk > 0;

  // ── 저장 전 미리보기 ────────────────────────────────────────────────────────
  // ⚠ 왜 필요한가: 자릿수를 하나 틀리면 원가가 10배가 되는데, 저장 뒤에야 보인다. 그때는 이미
  //   틀린 숫자가 화면 곳곳에 퍼져 있다. **넣은 값으로 최근 24시간을 다시 계산해** 먼저 보여 준다.
  //   0.25 를 2.5 로 잘못 치면 미리보기 금액이 열 배로 뛰므로 누르기 전에 잡힌다.
  const preview = useMemo(() => {
    if (!win || win.length === 0) return null;
    const now = summarizeWindow(win, prices, fx?.rate ?? null);
    if (confirm === 'fx' || (rate.trim() !== '' && fxOk)) {
      const next = summarizeWindow(win, prices, nRate);
      return { label: '환율', now, next, seen: true };
    }
    if (!priceOk) return null;
    const name = model.trim();
    const next = summarizeWindow(
      win,
      [
        ...prices.filter((p) => p.model !== name),
        { model: name, inputPer1m: nInp, cachedInputPer1m: nCached, outputPer1m: nOut,
          currency: 'USD', effectiveFrom: '', updatedAt: null },
      ],
      fx?.rate ?? null,
    );
    return { label: name, now, next, seen: win.some((w) => w.model === name) };
  }, [win, prices, fx, priceOk, model, nInp, nCached, nOut, confirm, rate, fxOk, nRate]);

  const previewText = (() => {
    if (!preview) return null;
    if (!preview.seen) {
      return `최근 ${COST_WINDOW_HOURS}시간에 "${preview.label}" 기록이 없어 미리 볼 수 없습니다. 값은 저장됩니다.`;
    }
    const fmt = (x: { usd: number; krw: number | null }) =>
      x.krw !== null ? krwText(x.krw) : `$${x.usd.toFixed(4)}`;
    const ratio = preview.now.usd > 0 ? preview.next.usd / preview.now.usd : null;
    return `이 값이면 최근 ${COST_WINDOW_HOURS}시간 원가가 ${fmt(preview.now)} → ${fmt(preview.next)} 가 됩니다`
      + (ratio !== null && (ratio >= 5 || ratio <= 0.2) ? ` — ⚠ ${ratio.toFixed(1)}배입니다. 자릿수를 확인해 주세요.` : '.');
  })();

  const savePrice = async () => {
    setConfirm(null); setBusy(true); setMsg(null);
    const ok = await adminPricingService.upsertPrice({
      model: model.trim(), inputPer1m: nInp, cachedInputPer1m: nCached, outputPer1m: nOut,
    });
    setBusy(false);
    setMsg(ok ? '단가를 저장했어요.' : '저장하지 못했어요. 관리자 권한과 연결을 확인해 주세요.');
    if (ok) { setModel(''); setInp(''); setCached(''); setOutp(''); onSaved(); }
  };
  const saveFx = async () => {
    setConfirm(null); setBusy(true); setMsg(null);
    const ok = await adminPricingService.setFx(nRate);
    setBusy(false);
    setMsg(ok ? '환율을 저장했어요.' : '저장하지 못했어요.');
    if (ok) { setRate(''); onSaved(); }
  };
  const saveDuk = async () => {
    setConfirm(null); setBusy(true); setMsg(null);
    const ok = await adminPricingService.setDukKrw(nDuk);
    setBusy(false);
    setMsg(ok ? '덕 1개의 값을 저장했어요.' : '저장하지 못했어요.');
    if (ok) { setDuk(''); onSaved(); }
  };

  return (
    <View style={{ gap: 10, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 10, padding: 16, backgroundColor: adminTheme.surface }}>
      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>모델 단가 · 환율</Text>
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        단가는 코드가 아니라 여기 저장됩니다. 요금제가 바뀌면 이 값만 고치면 되고 배포가 필요 없습니다.
      </Text>

      {/* ⚠ 오너는 개발자가 아니다. "요금 페이지를 보고 넣으세요" 로는 어느 줄인지 모른다.
          주소와 **어느 칸을 어디에 옮겨 적는지**까지 화면에 적는다. */}
      <View style={{ gap: 3, borderLeftWidth: 3, borderLeftColor: adminTheme.border, paddingLeft: 10 }}>
        <Text variant="bodySmall" style={{ color: adminTheme.ink }}>어디서 보고 넣나요</Text>
        <Text variant="caption" style={{ color: adminTheme.inkVariant }}>
          ① 요금 페이지: developers.openai.com/api/docs/pricing
        </Text>
        <Text variant="caption" style={{ color: adminTheme.inkVariant }}>
          ② 모델 이름(gpt-5-mini 등)을 찾아 <Text variant="caption" style={{ color: adminTheme.ink }}>Standard</Text> 행의
          {' '}Input · Cached input · Output 세 숫자를 아래 세 칸에 그대로 옮겨 적으세요.
          단위가 이미 100만 토큰당 USD 라 계산할 것이 없습니다.
        </Text>
        <Text variant="caption" style={{ color: adminTheme.warning }}>
          ⚠ Batch · Flex · Priority 행이 아니라 Standard 행입니다. 우리는 실시간 호출만 씁니다.
        </Text>
        <Text variant="caption" style={{ color: adminTheme.warning }}>
          ⚠ 추론(reasoning) 토큰 칸은 일부러 없습니다. OpenAI 가 추론을 <Text variant="caption" style={{ color: adminTheme.ink }}>출력 토큰으로 청구</Text>하고
          {' '}우리 로그의 출력 토큰에 이미 포함돼 있습니다(실측: 출력의 29.3%). 따로 넣으면 그만큼 두 번 셉니다.
        </Text>
      </View>

      <Text variant="bodySmall" style={{ color: adminTheme.ink }}>
        {prices.length === 0
          ? '⚠ 등록된 단가가 없습니다.'
          : `등록된 단가 ${prices.length}종: ${prices.map((p) => p.model).join(', ')}`}
        {fx ? ` · 환율 ₩${fx.rate.toLocaleString()}/USD${fx.effectiveFrom ? ` (${fx.effectiveFrom})` : ''}` : ' · ⚠ 환율 미입력 — 원화가 표시되지 않습니다'}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Input label="모델명" value={model} onChangeText={setModel} placeholder="gpt-5-mini" />
        <Input label="입력 / 1M (USD)" value={inp} onChangeText={setInp} placeholder="0.25" />
        <Input label="캐시 입력 / 1M (선택)" value={cached} onChangeText={setCached} placeholder="0.025" />
        <Input label="출력 / 1M (USD)" value={outp} onChangeText={setOutp} placeholder="2.0" />
      </View>
      <Button variant="primary" label="단가 저장" onPress={() => setConfirm('price')} disabled={!priceOk || busy} />

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Input label="환율 (₩/USD)" value={rate} onChangeText={setRate} placeholder="은행 고시 환율" />
        <Button variant="secondary" label="환율 저장" onPress={() => setConfirm('fx')} disabled={!fxOk || busy} />
      </View>

      {/* ⚠ 덕 1개의 값 — **마진을 보는 유일한 방법.** 코드에 박지 않는 이유는 매출 쪽 숫자
          (`TOPUP_PACKS.priceKrwHint`)가 코드가 스스로 "display hypothesis, not a charge" 라고
          적어 둔 가설이고 팩마다 다르기 때문이다. 가설을 곱하면 마진도 가설이 된다. */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Input label="덕 1개의 값 (₩)" value={duk} onChangeText={setDuk} placeholder="충전 금액 ÷ 받는 덕" />
        <Button variant="secondary" label="덕 값 저장" onPress={() => setConfirm('duk')} disabled={!dukOk || busy} />
      </View>
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        {dukKrw
          ? `지금 덕 1개 = ${krwText(dukKrw.rate)}${dukKrw.effectiveFrom ? ` (${dukKrw.effectiveFrom})` : ''}. 이 값으로 마진을 계산합니다.`
          : '⚠ 덕 1개의 값이 없어 마진이 표시되지 않습니다. 충전 팩 금액을 받는 덕 수로 나눈 값을 넣으세요 (예: 9,900원에 50덕이면 198).'}
      </Text>

      {previewText ? (
        <Text variant="bodySmall" style={{ color: adminTheme.warning }}>{previewText}</Text>
      ) : null}

      {msg ? <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>{msg}</Text> : null}

      <AdminConfirmDialog
        visible={confirm !== null}
        busy={busy}
        title={
          confirm === 'fx' ? '환율을 저장할까요?'
            : confirm === 'duk' ? '덕 1개의 값을 저장할까요?'
              : '단가를 저장할까요?'
        }
        what={
          (confirm === 'fx'
            ? `USD→KRW 환율을 ${nRate.toLocaleString()}원으로 정합니다.`
            : confirm === 'duk'
              ? `덕 1개를 ${nDuk.toLocaleString()}원으로 봅니다. 마진 계산에만 씁니다 — 상담 가격(5·12·50덕)은 그대로입니다.`
              : `${model.trim()} — 입력 ${nInp}/1M · 캐시 ${nCached === null ? '미입력' : `${nCached}/1M`} · 출력 ${nOut}/1M`)
          // ⚠ 미리보기를 확인창에도 넣는다. 오너가 마지막으로 보는 화면이 여기다.
          + (confirm !== 'duk' && previewText ? `\n\n${previewText}` : '')
        }
        scope="관리자 화면의 모든 원가 표시가 이 값으로 다시 계산됩니다. 사용자 화면과 과금에는 영향이 없습니다 — 이 값은 보고용입니다."
        reversible="되돌릴 수 있습니다 — 같은 자리에서 값을 다시 넣으면 덮어씁니다. 과거 로그도 새 값으로 다시 계산됩니다(그 시점 단가로 보관하지 않습니다)."
        confirmLabel="저장합니다"
        onCancel={() => setConfirm(null)}
        onConfirm={() => void (confirm === 'fx' ? saveFx() : confirm === 'duk' ? saveDuk() : savePrice())}
      />
    </View>
  );
}

export default function AdminAiUsageScreen() {
  const [items, setItems] = useState<AdminAiUsageItem[]>([]);
  const [prices, setPrices] = useState<ModelPriceRow[]>([]);
  const [fx, setFx] = useState<FxRateRow | null>(null);
  const [dukKrw, setDukKrw] = useState<FxRateRow | null>(null);
  // undefined = 로딩. 나머지는 `Outcome` 주석 참조.
  const [win, setWin] = useState<Outcome>(undefined);
  const loadPricing = useCallback(async () => {
    const [p, f, d, w] = await Promise.all([
      adminPricingService.listPrices(),
      adminPricingService.getFx(),
      adminPricingService.getDukKrw(),
      adminPricingService.costWindow(COST_WINDOW_HOURS),
    ]);
    setPrices(p);
    setFx(f);
    setDukKrw(d);
    setWin(w);
  }, []);
  // 단가 미리보기는 **행이 있을 때만** 뜻이 있다. 나머지 세 갈래는 미리 볼 것이 없다.
  const winRows = win !== undefined && win.kind === 'ok' ? win.rows : null;
  useEffect(() => { void loadPricing(); }, [loadPricing]);
  const [status, setStatus] = useState<Status>('loading');
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const loadTokenRef = useRef(0);

  const load = useCallback(
    (nextOffset: number, requestType: string) => {
      const token = loadTokenRef.current + 1;
      loadTokenRef.current = token;
      setStatus('loading');

      adminOpsService
        .listAiUsage({
          limit: PAGE_SIZE,
          offset: nextOffset,
          requestType: requestType || null,
        })
        .then((rows) => {
          if (token !== loadTokenRef.current) {
            return;
          }
          setItems(rows);
          setStatus('ready');
        })
        .catch(() => {
          if (token !== loadTokenRef.current) {
            return;
          }
          setStatus('error');
        });
    },
    [],
  );

  useEffect(() => {
    load(offset, typeFilter);
  }, [load, offset, typeFilter]);

  return (
    <Stack gap="xl">
      <AdminPageHeader
        title="AI 사용량 · 비용"
        subtitle="최근 24시간 원가는 집계 기준, 아래 표는 지금 조회된 목록 기준입니다. 단가·환율은 아래에서 오너가 넣습니다."
      />

      <CostWindowCard win={win} prices={prices} fx={fx} dukKrw={dukKrw} />

      <CostByModel items={items} prices={prices} fx={fx} dukKrw={dukKrw} />
      <PricingCard prices={prices} fx={fx} dukKrw={dukKrw} win={winRows} onSaved={() => void loadPricing()} />

      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
        모델별 사용량 로그
      </Text>

      <AdminSelect
        label="유형"
        options={TYPE_FILTER_OPTIONS}
        value={typeFilter}
        onChange={(v) => {
          setOffset(0);
          setTypeFilter(v);
        }}
      />

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'error' ? (
        <AdminStateView
          state="error"
          message="AI 사용량 로그를 불러오지 못했습니다. 유형 필터는 SQL 업데이트(ADMIN_04_UPDATE_usage_filter.sql) 적용 후 동작합니다."
          onRetry={() => load(offset, typeFilter)}
        />
      ) : items.length === 0 ? (
        <AdminStateView
          state="empty"
          message="기록된 AI 사용량이 없습니다. (Edge Function 재배포 후 상담이 발생하면 누적됩니다.)"
        />
      ) : (
        <Stack gap="md">
          {/* ⚠ 이 화면에서 **지금 확실히 읽을 수 있는 것**은 토큰이다. 금액은 단가표가 없어 계산할 수
              없고, 여기서 추정하면 그것이 곧 "만들어 낸 숫자" 가 된다.
              ⚠ 범위를 정확히 적는다 — 이것은 **지금 보이는 페이지의 합**이지 오늘 전체가 아니다.
              전체 합계는 RPC 가 집계를 돌려줘야 하고, 그건 새 RPC 다(이번 범위 밖). */}
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
            {`이 페이지 ${items.length}건 합계 — 입력 ${items.reduce((n, i) => n + (i.inputTokens ?? 0), 0).toLocaleString()} · `
              + `출력 ${items.reduce((n, i) => n + (i.outputTokens ?? 0), 0).toLocaleString()} 토큰 `
              + `(오늘 전체가 아니라 지금 보이는 목록의 합입니다)`}
          </Text>
          <AdminDataTable
            columns={COLUMNS}
            rows={items}
            keyExtractor={(item) => item.id}
            renderCell={(item, columnKey) => {
              if (columnKey === 'createdAt') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {formatDateTime(item.createdAt)}
                  </Text>
                );
              }
              if (columnKey === 'type') {
                return (
                  <Text variant="bodySmall" colorToken="textSecondary">
                    {item.requestType
                      ? (REQUEST_TYPE_LABEL[item.requestType] ?? item.requestType)
                      : '–'}
                  </Text>
                );
              }
              if (columnKey === 'model') {
                return <Text variant="bodySmall">{item.model ?? '–'}</Text>;
              }
              if (columnKey === 'status') {
                return (
                  <Text
                    variant="bodySmall"
                    colorToken={item.status === 'error' ? 'danger' : 'textSecondary'}
                  >
                    {item.status === 'error'
                      ? `오류${item.errorCode ? ` (${item.errorCode})` : ''}`
                      : '성공'}
                  </Text>
                );
              }
              if (columnKey === 'input') {
                return (
                  <Text variant="bodySmall">{formatCount(item.inputTokens)}</Text>
                );
              }
              if (columnKey === 'output') {
                return (
                  <Text variant="bodySmall">{formatCount(item.outputTokens)}</Text>
                );
              }
              return (
                <Text variant="bodySmall" colorToken="textSecondary">
                  {formatCount(item.latencyMs)}
                </Text>
              );
            }}
          />
          <AdminPagination
            offset={offset}
            limit={PAGE_SIZE}
            pageSize={items.length}
            onPrev={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </Stack>
      )}
    </Stack>
  );
}
