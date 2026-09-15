// Follow-up scope guard (§16). PURE. Deokbuni offers 역학/사주 해석·상담 — it does NOT perform legal, medical,
// or investment PROFESSIONAL SERVICES. A model-suggested follow-up that implies Deokbuni will review a
// contract, diagnose/treat a condition, or pick investments is out of scope and is DROPPED at the presentation
// layer. This never rewrites a suggestion and never touches the engine/decision; an emptied list just renders
// nothing (the free-form composer always remains). Conservative — matches only unambiguous professional-service
// offers, so ordinary 사업운/재물운/연애운/직장운 follow-ups are always kept.
const OUT_OF_SCOPE: readonly RegExp[] = [
  // legal document review / drafting, or direct legal action
  /(계약서|합의서|약관|서류|문서|초안)[^?]{0,20}(검토|작성|수정|리뷰)/,
  /(소송|고소|고발|법적\s*대응|변호사|법률\s*자문)/,
  // medical diagnosis / treatment
  /(진단|처방|질병\s*치료|복용|시술|수술)/,
  // direct investment picks / trade calls
  /(종목\s*추천|매수|매도|주식\s*추천|코인\s*추천|투자\s*종목|어디에\s*투자)/,
];

export function isInScopeFollowUp(q: string): boolean {
  const t = (q ?? '').trim();
  if (!t) return false;
  return !OUT_OF_SCOPE.some((re) => re.test(t));
}

export function filterFollowUpsToScope(items: readonly string[] | undefined): string[] {
  return (items ?? []).filter(isInScopeFollowUp);
}
