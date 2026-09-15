// Premium Report (50덕) — the widest product: 원국 전반 + 현재 대운·세운 + 향후 12개월.
//
// WHY IT EXISTS SEPARATELY FROM 상담: 상담 is question-driven and answers ONE proposition; Premium answers no
// question at all. It is the standing picture of a chart, so it follows the 오늘/월별 shape (deterministic
// evidence → plan → ONE realizing LLM call) rather than the consultation shape (question → judgment → cross).
//
// NAMING — there is already a `PremiumReportView` in `src/features/chat/report/`. That is the presentation of a
// STORED CONSULTATION report (`consultation_reports`), composed from a consultation the user already paid for.
// It is not this product and shares no code. Kept apart deliberately; see docs.
export const PREMIUM_POLICY_VERSION = 'premium-report@1.0.0';
export const PREMIUM_EVIDENCE_VERSION = 'premium-evidence@1.0.0';

/** Months of forward 월운 the report covers. Fixed: the product promise is "향후 12개월". */
export const PREMIUM_FORWARD_MONTHS = 12;

export type PremiumMonthOutlook = {
  /** Civil year/month the segment belongs to (KST). */
  year: number;
  month: number;
  /** 월운 십신 at the month midpoint — the frozen resolver's attribution, not a new calculation. */
  stemTenGod: string;
  branchTenGod: string;
  /**
   * 합 계열 — 천간합·육합·반합·삼합·방합. 위치와 상대까지 ("일주와 육합").
   *
   * WHY SPLIT FROM friction (2026-09-02): the V2 audit found the month evidence is ~50% 합 (27/50, 23/49,
   * 26/51, 23/49 across the four subjects) yet every one of the 48 delivered month lines read as a warning.
   * The cause was not a shortage of positive material — it was that "묶임" arrived unlabelled and the model
   * read every relation as trouble. Naming the polarity is what lets a 합 month be written as a 합 month.
   */
  harmony: string[];
  /** 충·형·자형·파·해·삼형. 조정이 필요한 신호. */
  friction: string[];
  /**
   * 아군(SUPPORT) / 타군(DRAIN) — `tenGodSide`의 고정 분류(비겁·인성 = 아군, 식상·재성·관성 = 타군).
   * 좋고 나쁨이 아니다. 강약 판정을 보류한 이상 어느 쪽이 유리한지 말할 수 없고, 말하지도 않는다.
   * 다만 "채우는 달"과 "쓰는 달"은 서로 다른 장면이므로, 열두 달을 같은 톤으로 쓰지 않게 해 준다.
   */
  side: 'SUPPORT' | 'DRAIN';
};

export type PremiumSection = { title: string; body: string };

export type PremiumReportResult = {
  /** One concrete line naming what this chart is about. */
  headline: string;
  /** 3–5 sentences: the standing shape of the chart. */
  natalSummary: string;
  /** The present 대운/세운 flow in plain language. Null when the engine could not resolve it. */
  flowSummary: string | null;
  /** Themed reads over the natal picture (성향 / 관계 / 일·재물 / 건강 …). Server-capped. */
  sections: PremiumSection[];
  /** The forward year, month by month, in prose. One line per covered month, in order. */
  monthlyOutlook: string[];
  /** Concrete "이렇게 보내세요" steps for the year. */
  actions: string[];
  /** Deterministic, server-owned evidence lines ("왜 이렇게 보나요"). Never model-authored. */
  evidence: string[];
};

export type PremiumReportRecord = {
  result: PremiumReportResult;
  policyVersion: string;
  evidenceVersion: string;
  coveredMonths: { year: number; month: number }[];
};

/**
 * What is stored in `consultation_reports.report_payload` for `report_type = 'premium'`.
 *
 * DELIBERATELY NOT the generic 6-field `ConsultationReportPayload`. That shape (summary + keyFindings +
 * cautions + coveredTopics) would flatten Premium's section titles away and squash twelve months into an
 * undifferentiated list — a lossy fit for the product a reader paid 50덕 for. The column is `jsonb` and the
 * table already carries a `report_type` discriminator, so a second payload shape costs nothing and keeps the
 * report readable. The RENDERER is still shared: a projection turns this into the same view-model
 * `PremiumReportView` already consumes.
 */
export type PremiumReportPayload = {
  kind: 'premium_report';
  result: PremiumReportResult;
  coveredMonths: { year: number; month: number }[];
  policyVersion: string;
  evidenceVersion: string;
  /** ISO. Passed in by the caller so the projection stays deterministic (no Date.now in presentation). */
  generatedAt: string;
};
