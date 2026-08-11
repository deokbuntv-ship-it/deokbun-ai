// QimenBoard → engine-external EngineEvidence (directive §23). BOUNDED, FACTS-ONLY:
// 음양둔·국수·節氣/三元·값부/값사·구궁 layered facts. It does NOT interpret ("동쪽으로
// 가면 좋다" 등). Availability maps onto the shared EngineEvidence contract.
import type { EngineEvidence, EngineEvidenceAvailability } from '@/features/analysis';

import type { QimenBoard, QimenResult } from '../domain/qimenTypes';

function mapAvailability(a: QimenResult['availability']): EngineEvidenceAvailability {
  switch (a) {
    case 'available':
      return 'available';
    case 'not_applicable':
      return 'not_applicable';
    // The shared enum has no 'missing_question_time'; the QimenResult.reason
    // carries the specific cause. Treat inability-to-compute as calculation_failed.
    default:
      return 'calculation_failed';
  }
}

function factSummary(b: QimenBoard): string {
  const dun = b.dunType === 'yang' ? '陽遁' : '陰遁';
  return [
    `${dun} ${b.ju}국`,
    `節氣 ${b.solarTerm}(${b.sanyuan})`,
    `값부(值符) ${b.zhifu}`,
    `값사(值使) ${b.zhishi}`,
  ].join(' · ');
}

function factDetail(b: QimenBoard): string {
  const lines = b.palaces.map((p) => {
    const door = [p.earthDoor, p.heavenDoor].filter(Boolean).join('/');
    const bits = [
      `地盤 ${p.earthPlate}`,
      `天盤 ${p.heavenPlate}`,
      p.star,
      door,
      p.god,
    ].filter(Boolean);
    return `${p.palaceLabel}: ${bits.join(', ')}`;
  });
  lines.unshift(
    `질문 干支 年 ${b.ganzhi.year} 月 ${b.ganzhi.month} 日 ${b.ganzhi.day} 時 ${b.ganzhi.hour} · 旬首 ${b.xunHead} · 符首 ${b.fuHead}`,
  );
  return lines.join('\n');
}

export function toQimenEvidence(result: QimenResult): EngineEvidence {
  const availability = mapAvailability(result.availability);
  if (result.board) {
    return {
      availability,
      summary: factSummary(result.board),
      detail: factDetail(result.board),
    };
  }
  return { availability };
}
