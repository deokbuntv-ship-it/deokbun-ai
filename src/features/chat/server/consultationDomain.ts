// Deterministic consultation DOMAIN classification (Sprint E §8). A small, pure keyword classifier used to
// persist the topic of a turn in decisionMeta, so a follow-up ("그럼 내년은?") can preserve the previous
// domain server-side instead of inferring it from free-form prose. Not a ranking, not astrology — just a
// stable topic label. '전반' = no specific domain resolved.
export type ConsultationDomain =
  | '사업' | '창업' | '이직' | '직업' | '재물' | '결혼' | '연애' | '관계' | '건강' | '시험' | '이사' | '계약' | '전반';

export function classifyConsultationDomain(question: string): ConsultationDomain {
  const q = question ?? '';
  if (/창업|개업/.test(q)) return '창업';
  if (/사업|장사|가게|매출|자영업/.test(q)) return '사업';
  if (/이직|전직|퇴사/.test(q)) return '이직';
  if (/직업|직장|취업|커리어|일자리|진로/.test(q)) return '직업';
  if (/재물|재정|돈|투자|자산|수입|금전|씀씀이/.test(q)) return '재물';
  if (/결혼|혼인|약혼/.test(q)) return '결혼';
  if (/연애|사랑|썸|이성|애인|인연/.test(q)) return '연애';
  if (/인간관계|대인|관계운|사람\s*관계/.test(q)) return '관계';
  if (/건강|질병|몸|체력|컨디션/.test(q)) return '건강';
  if (/시험|합격|수능|자격증|취득|고시/.test(q)) return '시험';
  if (/이사|이주|이전|이사운|집을?\s*(옮|사)/.test(q)) return '이사';
  if (/계약|서명|거래|체결/.test(q)) return '계약';
  return '전반';
}
