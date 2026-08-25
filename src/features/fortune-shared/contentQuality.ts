// CONSUMER CONTENT-QUALITY guards for 오늘/월별 fortune prose. A 운세 reading gives life direction — it must
// NOT read like a finance/admin service checklist or invent arbitrary micro-tasks (Device-QA finding). These
// are CONSERVATIVE, unambiguous patterns (same fail-closed role as containsRawGanji) — the prompt is the
// primary lever; this catches only the clearest violations the model should never emit. No NLP, no LLM pass.

// Finance/admin service-checklist phrasing that reads as procedural service advice, not a fortune.
const SERVICE_CHECKLIST = [
  /영수증/,
  /계좌\s*(내역|이체)/,
  /카드\s*(내역|명세)/,
  /청구서/,
  /자동이체/,
  /환불\s*(절차|처리)/,
  /대출\s*(신청|실행|상담|한도)/,
  /투자\s*(실행|축소|종목|비중)/,
  /(세금계산서|명세서|거래내역)/,
  /체크리스트/,
];

// Fabricated arbitrary micro-tasks with no myungri basis ("최근 30일", "10분 동안", "N개로 분류").
const MICRO_TASK = [
  /최근\s*\d+\s*일/,
  /\d+\s*분\s*(동안|만에|안에)/,
  /\d+\s*개(로)?\s*(분류|정리)/,
];

/** True when the prose reads as a finance/admin service checklist or a fabricated micro-task (reject/scrub). */
export function containsServiceChecklistTone(text: string): boolean {
  return SERVICE_CHECKLIST.some((re) => re.test(text)) || MICRO_TASK.some((re) => re.test(text));
}

// Advice families used to detect one intent dominating a whole reading (§12/§15). Presentation-only — NOT a
// myungri rule. Each family is a set of surface markers; a reading whose sections all reduce to ONE family is
// a quality failure (the sections should play different roles: opportunity / risk / direction).
const ADVICE_FAMILIES: Record<string, RegExp> = {
  ORGANIZE: /정리|정돈|분류|목록/,
  REVIEW: /확인|점검|살펴|체크/,
  PACE: /천천히|서두르지|속도|미루/,
};

/**
 * How many DISTINCT advice families the given section texts collapse into. Used by tests + as a soft signal:
 * if several sections all map to the SAME single family, the reading is repetitive.
 */
export function distinctAdviceFamilies(sectionTexts: readonly string[]): number {
  const hit = new Set<string>();
  for (const [family, re] of Object.entries(ADVICE_FAMILIES)) {
    if (sectionTexts.some((t) => re.test(t))) hit.add(family);
  }
  return hit.size;
}

/** True when EVERY non-empty section reduces to the SAME single advice family (repetition failure, §37). */
export function isSingleAdviceFamilyCollapse(sectionTexts: readonly string[]): boolean {
  const nonEmpty = sectionTexts.filter((t) => t && t.trim().length > 0);
  if (nonEmpty.length < 3) return false; // too few sections to judge
  const families = Object.entries(ADVICE_FAMILIES).filter(([, re]) => nonEmpty.every((t) => re.test(t)));
  return families.length >= 1; // one family matches ALL sections → collapsed
}
