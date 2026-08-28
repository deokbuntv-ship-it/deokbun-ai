// ⚠️ THE ONLY FILE IN DeokbunAI THAT IMPORTS `qimen-dunjia`.
//
// All coupling to the Core is isolated here (directive §21/§25). We import the
// CJS **dist** build (`qimen-dunjia/dist/qimen.min.js`) — the package's ESM entry
// would break the CJS jest runner; the dist requires cleanly in both jest and
// Metro. No node_modules patching. Deterministic: pure calc, no network/LLM/DB.
import {
  chartToObject,
  generateChartByDatetime,
} from 'qimen-dunjia/dist/qimen.min.js';

import { formatQueryDatetime, type QimenQueryTime } from '../domain/qimenTypes';

// Version tracking (§18). Must match the exact pin in package.json.
export const QIMEN_LIBRARY = 'qimen-dunjia';
export const QIMEN_LIBRARY_VERSION = '3.1.0';
export const QIMEN_ADAPTER_VERSION = '1.0.0';
// The library uses 拆補法 (Chai Bu) to fix the 局; that is the documented method.
export const QIMEN_RULESET_VERSION = `qimen-dunjia-chaibu@${QIMEN_LIBRARY_VERSION}`;

// Narrow raw shape — the subset of the qimen-dunjia board object DeokbunAI reads.
// Keys are the library's Chinese field names; the result adapter reads THESE, so
// nothing above imports the library.
export type RawQimenBoard = {
  局數: number;
  陰陽: string;
  三元: string;
  節氣: string;
  節後天數?: number;
  年柱: string;
  月柱: string;
  日柱: string;
  時柱: string;
  時干: string;
  旬首: string;
  符首: string;
  值符: string;
  值使: string;
  值符落宮: string;
  值使落宮: string;
  九宮: string[];
  地盤: string[];
  天盤: string[];
  地門: string[];
  天門: string[];
  九星: string[];
  八神: string[];
};

// Cast a board from a query wall-clock time. Throws on Core failure — the service
// maps that to `calculation_failed` (never a guessed board).
export function castBoard(qt: QimenQueryTime): RawQimenBoard {
  const raw = chartToObject(generateChartByDatetime(formatQueryDatetime(qt)));
  return raw as unknown as RawQimenBoard;
}
