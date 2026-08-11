// Raw qimen-dunjia board → DeokbunAI QimenBoard (directive §21). Pure mapping —
// no recomputation, no interpretation. The Core's layered arrays (地盤/天盤/地門/
// 天門/九星/八神) are zipped per palace index, preserving the Core's ordering; no
// palace position is fabricated (the 九宮 label from the Core identifies each).
import type { QimenBoard, QimenPalace, QimenQueryTime } from '../domain/qimenTypes';
import {
  QIMEN_ADAPTER_VERSION,
  QIMEN_LIBRARY,
  QIMEN_LIBRARY_VERSION,
  QIMEN_RULESET_VERSION,
  type RawQimenBoard,
} from './qimenCoreAdapter';

function zipPalaces(raw: RawQimenBoard): QimenPalace[] {
  const n = raw.九宮?.length ?? 0;
  const at = (arr: string[] | undefined, i: number) => (arr && arr[i] !== undefined ? arr[i] : '');
  const out: QimenPalace[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push({
      index: i,
      palaceLabel: at(raw.九宮, i),
      earthPlate: at(raw.地盤, i),
      heavenPlate: at(raw.天盤, i),
      earthDoor: at(raw.地門, i),
      heavenDoor: at(raw.天門, i),
      star: at(raw.九星, i),
      god: at(raw.八神, i),
    });
  }
  return out;
}

export function adaptBoard(raw: RawQimenBoard, queryTime: QimenQueryTime): QimenBoard {
  return {
    engine: 'qimen',
    engineVersion: QIMEN_ADAPTER_VERSION,
    library: QIMEN_LIBRARY,
    libraryVersion: QIMEN_LIBRARY_VERSION,
    ruleSetVersion: QIMEN_RULESET_VERSION,
    queryTime,
    dunType: raw.陰陽 === '陽' ? 'yang' : 'yin',
    ju: raw.局數,
    sanyuan: raw.三元,
    solarTerm: raw.節氣,
    daysAfterTerm: raw.節後天數,
    ganzhi: { year: raw.年柱, month: raw.月柱, day: raw.日柱, hour: raw.時柱 },
    hourStem: raw.時干,
    xunHead: raw.旬首,
    fuHead: raw.符首,
    zhifu: raw.值符,
    zhishi: raw.值使,
    zhifuPalace: raw.值符落宮,
    zhishiPalace: raw.值使落宮,
    palaces: zipPalaces(raw),
    warnings: [],
  };
}
