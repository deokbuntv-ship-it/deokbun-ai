// 절기 경계일 — the Edge defence layer. A birth on a 節 boundary date with no EXACT time cannot produce a
// 월주, so the consultation is a typed non-success. It must arrive as its own reason code, and it must take
// the SAME release path as GROUNDING_UNAVAILABLE so nothing is charged.
//
// Anchor: REG4-SUBJ-10 from the V8 Blind-84 run — 1996-10-08 (寒露 08:18:42 KST), birth time unknown,
// 7 of 7 consultations failed.
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
const SERVER_NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);

const GOOD_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation:
    '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. '
    + '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'],
  cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
  followUps: ['어떤 방식이 맞을까요?'],
});

const birth = (over: Partial<BirthInfoDraft>): BirthInfoDraft => ({
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1996', birthMonth: '10', birthDay: '8', birthTimeAccuracy: 'unknown', birthHour: '',
  birthMinute: '', approximateTimePeriod: null, birthPlace: '서울',
  ...over,
});

const deps: ServerConsultationDeps = {
  digestProvider,
  nowEpochSeconds: SERVER_NOW,
  async callLLM() { return GOOD_ANSWER; },
};

const request = (b: BirthInfoDraft): ServerConsultationRequest => ({
  birthInput: b,
  question: '제 타고난 성격은 어떤가요?',
});

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('buildServerConsultation — 절기 boundary date reason code', () => {
  it('1996-10-08 with an unknown time returns AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED, not the generic code', async () => {
    const r = await buildServerConsultation(request(birth({})), deps);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED');
    expect(r.message).toEqual(expect.stringContaining('절기 경계일'));
  });

  it('the same date with an APPROXIMATE time returns the same code — approximate does not resolve it', async () => {
    const r = await buildServerConsultation(
      request(birth({ birthTimeAccuracy: 'approximate', approximateTimePeriod: 'morning' })),
      deps,
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED');
  });

  it('1996-10-09 with an unknown time is NOT a boundary failure — the reading runs', async () => {
    const r = await buildServerConsultation(request(birth({ birthDay: '9' })), deps);
    if (!r.ok) expect(r.reason).not.toBe('AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED');
    else expect(r.ok).toBe(true);
  });

  it('the boundary date with an EXACT time is not a boundary failure', async () => {
    const r = await buildServerConsultation(
      request(birth({ birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0' })),
      deps,
    );
    if (!r.ok) expect(r.reason).not.toBe('AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED');
    else expect(r.ok).toBe(true);
  });
});

// The 덕-차감-0 guarantee is structural: the new code shares GROUNDING_UNAVAILABLE's branch, so the release
// calls cannot drift apart. These assertions fail the moment someone splits it into a parallel path.
describe('Edge contract — the new reason keeps the 0-덕 release path', () => {
  const root = path.resolve(__dirname, '../../../../..');
  const edgeSource = fs.readFileSync(path.join(root, 'supabase/functions/chat/index.ts'), 'utf8');

  it('REASON_STATUS maps the code to 422 (client-correctable, not a server fault)', () => {
    expect(edgeSource).toMatch(/AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED:\s*422/);
  });

  it('it is handled in the SAME branch as GROUNDING_UNAVAILABLE', () => {
    expect(edgeSource).toContain(
      "if (result.reason === 'GROUNDING_UNAVAILABLE' || result.reason === 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED')",
    );
  });

  it('that branch releases the reservation and the held 덕', () => {
    const start = edgeSource.indexOf(
      "if (result.reason === 'GROUNDING_UNAVAILABLE' || result.reason === 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED')",
    );
    expect(start).toBeGreaterThan(-1);
    const branch = edgeSource.slice(start, start + 700);
    expect(branch).toContain('releasePaidRequest(paid.context)');
    expect(branch).toContain('releaseDukIfHeld()');
  });

  it('there is no second, parallel handler for the code', () => {
    const handlers = edgeSource.match(/result\.reason === 'AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED'/g) ?? [];
    expect(handlers).toHaveLength(1);
  });

  it('the committed Edge bundle exports the shared gate (rebuild was not skipped)', () => {
    const bundle = fs.readFileSync(path.join(root, 'supabase/functions/chat/_server/serverBundle.mjs'), 'utf8');
    expect(bundle).toContain('function isSolarTermBoundaryTimeRequired');
    expect(bundle).toContain('AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED');
  });
});
