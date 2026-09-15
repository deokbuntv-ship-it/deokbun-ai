// QimenBoard → engine-external EngineEvidence (directive §11/§23). BOUNDED, FACTS-ONLY:
// 음양둔·국수·節氣/三元·값부/값사·구궁 layered facts of the QUESTION-TIME board. It does NOT interpret
// ("동쪽으로 가면 좋다" 등). Availability maps onto the shared EngineEvidence contract.
//
// Structured `sections` (Qimen V1 integration) mirror the Saju/Ziwei evidence so the grounding renderer
// delivers the facts to the prompt. `근거·한계` states the HONEST validation split (matching the golden
// test): 陰陽遁·三元·節氣·query 干支 are independently cross-checked (lunar-javascript + universal 二至/拆補
// rules); 局數·八門·九星·八神 placement is PROVIDER_DETERMINISTIC_CHARACTERIZATION_LOCKED (school-dependent),
// NOT independently validated. Question-time only — NOT long-term year timing (§12).
import type { EngineEvidence, EngineEvidenceAvailability, EngineEvidenceSection } from '@/features/analysis';

import { QIMEN_ADAPTER_VERSION } from './qimenCoreAdapter';
import type { QimenBoard, QimenQueryTime, QimenResult } from '../domain/qimenTypes';

function mapAvailability(a: QimenResult['availability']): EngineEvidenceAvailability {
  switch (a) {
    case 'available':
      return 'available';
    case 'not_applicable':
      return 'not_applicable';
    // The shared enum has no 'missing_question_time'; the QimenResult.reason carries the specific cause.
    default:
      return 'calculation_failed';
  }
}

const dunLabel = (b: QimenBoard): string => (b.dunType === 'yang' ? '陽遁' : '陰遁');
const qtLabel = (qt: QimenQueryTime): string =>
  `${qt.year}-${String(qt.month).padStart(2, '0')}-${String(qt.day).padStart(2, '0')} ${String(qt.hour).padStart(2, '0')}시(Asia/Seoul)`;

function factSummary(b: QimenBoard): string {
  return [
    `${dunLabel(b)} ${b.ju}국`,
    `節氣 ${b.solarTerm}(${b.sanyuan})`,
    `값부(值符) ${b.zhifu}`,
    `값사(值使) ${b.zhishi}`,
  ].join(' · ');
}

function factDetail(b: QimenBoard): string {
  const lines = b.palaces.map((p) => {
    const door = [p.earthDoor, p.heavenDoor].filter(Boolean).join('/');
    const bits = [`地盤 ${p.earthPlate}`, `天盤 ${p.heavenPlate}`, p.star, door, p.god].filter(Boolean);
    return `${p.palaceLabel}: ${bits.join(', ')}`;
  });
  lines.unshift(
    `질문 干支 年 ${b.ganzhi.year} 月 ${b.ganzhi.month} 日 ${b.ganzhi.day} 時 ${b.ganzhi.hour} · 旬首 ${b.xunHead} · 符首 ${b.fuHead}`,
  );
  return lines.join('\n');
}

function basisLines(b: QimenBoard): string[] {
  const after = typeof b.daysAfterTerm === 'number' ? `(節後 ${b.daysAfterTerm}일)` : '';
  return [
    `질문 시점 ${qtLabel(b.queryTime)} — 출생 기반 아님(상황판)`,
    `${dunLabel(b)} ${b.ju}국 · 三元 ${b.sanyuan} · 節氣 ${b.solarTerm}${after}`,
    `질문 干支 年 ${b.ganzhi.year} · 月 ${b.ganzhi.month} · 日 ${b.ganzhi.day} · 時 ${b.ganzhi.hour} · 時干 ${b.hourStem} · 旬首 ${b.xunHead} · 符首 ${b.fuHead}`,
  ];
}

function palaceLines(b: QimenBoard): string[] {
  return b.palaces.map((p) => {
    const door = [p.earthDoor, p.heavenDoor].filter(Boolean).join('/');
    const bits = [`地盤 ${p.earthPlate}`, `天盤 ${p.heavenPlate}`, p.star, door, p.god].filter(Boolean);
    return `${p.palaceLabel}: ${bits.join(' · ')}`;
  });
}

function provenanceLines(b: QimenBoard): string[] {
  return [
    `엔진 기문둔갑(${b.library}@${b.libraryVersion}, adapter ${QIMEN_ADAPTER_VERSION}) · 규칙 ${b.ruleSetVersion}(時家·拆補法)`,
    '시점 기준: 질문(상담) 제출 순간의 Asia/Seoul 지방시각(UTC+9 고정, V1 한국 전용 정책)을 局 계산 기준으로 사용합니다.',
    '가정: 質問時刻이 있어야 계산 가능(출생 시각·출생 명식을 기문 局에 재사용하지 않음) · 局法은 拆補法(節後 5일=1원).',
    '검증 범위: 陰陽遁·三元·節氣·질문 四柱 干支는 독립 오라클(lunar-javascript)+보편 二至/拆補 규칙으로 교차 검증됨. 局數(1~9)·八門·九星·八神의 궁별 배치는 provider(qimen-dunjia 時家) 기준 결정론적 계산이며 제2 권위 오라클로 독립 검증된 것이 아닙니다(특성 고정, characterization-locked, 학파 의존).',
    '한계: provider가 지원하지 않는 節氣/입력은 局을 만들지 않고 실패 처리(fail-closed)합니다. 이 상황판은 질문 시점 기준이며 특정 장기 연도(예: 2028년)를 예측하는 근거가 아닙니다.',
  ];
}

function factSections(b: QimenBoard): EngineEvidenceSection[] {
  return [
    { label: '상황판 기준(질문 시점)', lines: basisLines(b) },
    { label: '값부·값사', lines: [`값부(值符) ${b.zhifu} → ${b.zhifuPalace}`, `값사(值使) ${b.zhishi} → ${b.zhishiPalace}`] },
    { label: '구궁(九宮)', lines: palaceLines(b) },
    { label: '근거·한계', lines: provenanceLines(b) },
  ];
}

export function toQimenEvidence(result: QimenResult): EngineEvidence {
  const availability = mapAvailability(result.availability);
  if (result.board) {
    return {
      availability,
      summary: factSummary(result.board),
      detail: factDetail(result.board),
      sections: factSections(result.board),
      // Question-time situational board — NOT long-term (Daewoon/Sewoon/Wolwoon-style) timing. Qimen
      // does NOT license specific future-year claims; timing anchors stay owned by the Saju evidence (§12).
      hasTimingEvidence: false,
    };
  }
  return { availability };
}
